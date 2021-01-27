import arg from "arg"
import { exit } from "process";
import { readFile } from "fs/promises"
import Employee, { EmployeeRank, promptForEmployee } from "./Employee";
import Dispatcher from "./Dispatcher"
import prompts from "prompts";
import CallGenerator from "./CallGenerator";

const args = arg({
    // Types
    '--help': Boolean,
    '--employees': String,

    // Aliases
    '-e': '--employees',
    '-h': '--help',
});

if (args["--help"]) {
    // display help
    console.log('Usage: call-router [--employees <employee_file>]')
    exit(0);
}




const run = async () => {
    const generator = new CallGenerator()
    const dispatcher = new Dispatcher()

    const employeeFile = args["--employees"]
    if (employeeFile) {
        const employees = await getEmployeesFromFile(employeeFile)
        if (employees) {
            dispatcher.addEmployee(employees)
        }
    }

    generator.addListener(call => {
        dispatcher.dispatchCall(call)
    })

    while (await promptMainMenu(dispatcher, generator)) { /* Keep running the main menu. */ }
}

run().catch(error => {
    console.error(error)
    exit(1)
})

type RawPersonType = {
    name: string
    id?: number
    rank: string
}

async function getEmployeesFromFile(filePath: string): Promise<Employee[] | null> {
    let employeeFileText: string;
    try {
        employeeFileText = await readFile(filePath, 'utf8')
        return parseEmployeesFromJSON(employeeFileText)
    } catch (error) {
        console.error(`We encountered issues reading '${filePath}'. Make sure it's a valid file.`)
        //throw new Error(`We encountered issues reading '${filePath}'. Make sure it's a valid file.`);
    }
    return null
}

function parseEmployeesFromJSON(input: string) {
    const props: RawPersonType[] = JSON.parse(input)

    if (!Array.isArray(props)) {
        throw new Error("The provided file is not in the correct format\n\
        Make sure it is an array of objects, with a name and rank property, and an optional id.");
    }

    const employeeObjects = props.map(({ name, id, rank }) => {
        const convertedRank = EmployeeRank[rank as keyof typeof EmployeeRank] ?? EmployeeRank.junior
        return new Employee(name, convertedRank, id)
    })

    return employeeObjects
}

type MainMenuPromptType = {
    value?: () => void
}
async function promptMainMenu(dispatcher: Dispatcher, generator: CallGenerator): Promise<true> {
    const {value}: MainMenuPromptType = await prompts({
        type: 'select',
        name: 'value',
        message: 'What would you like to do?',
        choices: [
            { title: 'Add employees', value: () => promptAddEmployees(dispatcher) },
            { title: 'Remove employees', disabled: !dispatcher.hasEmployees(), value: () => promptRemoveEmployees(dispatcher) },
            { title: 'Show employees', disabled: !dispatcher.hasEmployees(), value: () => promptShowEmployees(dispatcher) },
            { title: 'Show calls', value: () => promptShowCalls(dispatcher) },
            { title: 'Generate calls', value: () => promptGenerateCalls(generator) },
            { title: 'Set the options for automatic call generation', value: () => promptCallGeneratorOptions(generator) },
            { title: 'Quit', value: () => { exit(0) } },
        ],
    })

    if(value){
        await value()
    }

    return true;
}

type AddEmployeesPromptType = {
    value?: 'file' | 'manual'
}
async function promptAddEmployees(dispatcher: Dispatcher) {
    const { value }: AddEmployeesPromptType = await prompts({
        type: 'select',
        name: 'value',
        message: 'Would you like to load from a file, or enter employees manually?',
        choices: [
            { title: 'From file', value: 'file' },
            { title: 'Manually', value: 'manual' },
        ],
        initial: 1
    })

    if (value === 'file') {
        const { path }: { path: string } = await prompts({
            type: 'text',
            name: 'path',
            message: `Path to file...`,
        })
        const employees = await getEmployeesFromFile(path)
        if (employees) {
            dispatcher.addEmployee(employees)
        }
        return;
    }

    if (value === 'manual') {
        const employee = await promptForEmployee()
        if (employee) {
            dispatcher.addEmployee(employee)
        }

        while ((await prompts({
            type: 'confirm',
            name: 'result',
            message: 'Would you like to add another?',
            initial: true
        })).result) {
            const employee = await promptForEmployee()
            if (employee) {
                dispatcher.addEmployee(employee)
            } else {
                break;
            }
        }
    }
}

type RemoveEmployeesPromptType = {
    value?: Employee[]
}
async function promptRemoveEmployees(dispatcher: Dispatcher) {
    const { value: peopleToDelete }: RemoveEmployeesPromptType = await prompts({
        type: 'multiselect',
        name: 'value',
        message: 'Choose the employees to remove.',
        choices: dispatcher.allEmployees.map(employee => ({ title: employee.name, value: employee })),
        hint: '- Space to select. Return to submit'
    })

    if(peopleToDelete) {
        dispatcher.removeEmployee(peopleToDelete)
    }
}

function promptShowEmployees(dispatcher: Dispatcher) {
    console.log(dispatcher.printEmployees())
}

function promptShowCalls(dispatcher: Dispatcher) {
    console.log(dispatcher.printCalls())
}

function promptGenerateCalls(generator: CallGenerator) {
    return generator.promptGenerateCalls()
}

enum CallGeneratorOptions {
    time,
    length,
    initialSeverity,
    upgradeChance,
    back
}
        
type CallGeneratorOptionsPromptType = {
    choice?: CallGeneratorOptions
}

async function promptCallGeneratorOptions(generator: CallGenerator) {
    let done = false;
    do {
        const { choice }: CallGeneratorOptionsPromptType = await prompts({
            type: 'select',
            name: 'choice',
            message: 'Which option would you like to adjust?',
            choices: [
                { title: 'Time between calls.', value: CallGeneratorOptions.time },
                { title: 'Length of calls.', value: CallGeneratorOptions.length },
                { title: 'Ratio of the calls initial severity.', value: CallGeneratorOptions.initialSeverity },
                { title: 'Ratio of calls that upgrade in severity.', value: CallGeneratorOptions.upgradeChance },
                { title: 'Go back.', value: CallGeneratorOptions.back },
            ],
        })

        switch (choice) {
            case CallGeneratorOptions.time:
                await generator.promptTime()
                break;
            case CallGeneratorOptions.length:
                await generator.promptLength()
                break;
            case CallGeneratorOptions.initialSeverity:
                await generator.promptSeverity()
                break;
            case CallGeneratorOptions.upgradeChance:
                await generator.promptUpgrade()
                break;
            case CallGeneratorOptions.back: // falls through
            default:
                done = true
        }
    } while (!done)
}
