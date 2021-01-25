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



run().catch(error => {
    console.error(error)
    exit(1)
})


async function run() {
    const generator = new CallGenerator()
    const dispatcher = new Dispatcher()

    const employeeFile = args["--employees"]
    if (employeeFile) {
        dispatcher.addEmployee(await getEmployeesFromFile(employeeFile))
    }

    generator.addListener(call => {
        dispatcher.dispatchCall(call)
    })

    while (await promptMainMenu(dispatcher)) { /* Keep running the main menu. */ }
}

type RawPersonType = {
    name: string
    id?: number
    rank: string
}

async function getEmployeesFromFile(filePath: string) {
    let employeeFileText: string;
    try {
        employeeFileText = await readFile(filePath, 'utf8')
    } catch (error) {
        throw new Error(`We encountered issues reading '${filePath}'. Make sure it's a valid file.`);
    }
    return parseEmployeesFromJSON(employeeFileText)

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

async function promptMainMenu(dispatcher: Dispatcher): Promise<true> {
    const result = await prompts({
        type: 'select',
        name: 'value',
        message: 'What would you like to do?',
        choices: [
            { title: 'Add employees', value: () => promptAddEmployees(dispatcher) },
            { title: 'Remove employees', value: () => promptRemoveEmployees(dispatcher) },
            { title: 'Show employees', value: () => promptShowEmployees(dispatcher) },
            { title: 'Show calls', value: () => promptShowCalls(dispatcher) },
            { title: 'Generate calls', value: () => promptGenerateCalls(dispatcher) },
            { title: 'Set automatic call generation', value: () => promptCallGeneratorOptions(dispatcher) },
            { title: 'Quit', value: () => { exit(0) } },
        ],
        // initial: 1
    })

    await result.value()

    return true;
}

async function promptAddEmployees(dispatcher: Dispatcher) {
    const { value } = await prompts({
        type: 'select',
        name: 'value',
        message: 'Would you like to load from a file, or enter employees manually?',
        choices: [
            { title: 'From file', value: 'file' },
            { title: 'Manually', value: 'manual' },
        ],
    })

    if (value === 'file') {
        const { path } = await prompts({
            type: 'text',
            name: 'path',
            message: `Path to file...`,
        })

        dispatcher.addEmployee(await getEmployeesFromFile(path))
        return;
    }

    if (value === 'manual') {
        dispatcher.addEmployee(await promptForEmployee())

        while ((await prompts({
            type: 'confirm',
            name: 'result',
            message: 'Would you like to add another?',
            initial: true
        })).result) {
            dispatcher.addEmployee(await promptForEmployee())
        }
    }
}

async function promptRemoveEmployees(dispatcher: Dispatcher) {
    const peopleToDelete = await prompts({
        type: 'multiselect',
        name: 'value',
        message: 'Choose the employees to remove.',
        choices: dispatcher.allEmployees.map(employee => ({ title: employee.name, value: employee })),
        hint: '- Space to select. Return to submit'
    })

    dispatcher.removeEmployee(peopleToDelete.value)
}

function promptShowEmployees(dispatcher: Dispatcher) {
    console.log(dispatcher.printEmployees())
}

function promptShowCalls(dispatcher: Dispatcher) {
    console.log(dispatcher.printCalls())
    //console.log("TODO: Display the status of all ongoing calls.")
}

function promptGenerateCalls(dispatcher: Dispatcher) {
    console.log("TODO: Generate some calls.")
}

function promptCallGeneratorOptions(dispatcher: Dispatcher) {
    console.log("TODO: Show options for the generator.")
}