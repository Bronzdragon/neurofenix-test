import arg from "arg"
import { exit } from "process";
import { readFile } from "fs/promises"
import Employee, { EmployeeRank, promptForEmployee } from "./Employee";
import EmployeeContainer from "./EmployeeContainer";
import prompts from "prompts";

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

const container = new EmployeeContainer()

run(container).catch(error => {
    console.error(error)
    exit(1)
})

async function run(container: EmployeeContainer) {
    const employeeFile = args["--employees"] ?? './empoyeesExample.json'
    if (employeeFile) {
        try {
            const employeeFileText = await readFile(employeeFile, 'utf8')
            container.addEmployee(parseEmployeesFromJSON(employeeFileText))
        } catch (error) {
            throw new Error(`You provided an employee file ('${employeeFile}'), but we could not parse it.`);

        }
    }

    if (container.length < 1) {
        console.log("No employees found.")
        while ((await prompts({ type: 'confirm', name: 'value', message: 'Would you like to add some more?', initial: true })).value === true) {
            container.addEmployee(await promptForEmployee())
        }
    }

}

type RawPersonType = {
    name: string
    id?: number
    rank: string
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