import arg from "arg"
import { exit } from "process";
import { readFile } from "fs/promises"
import Employee, { EmployeeRank } from "./Employee";
import Dispatcher from "./Dispatcher"
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

const container = new Dispatcher()

run(container).catch(error => {
    console.error(error)
    exit(1)
})

async function run(dispatcher: Dispatcher) {
    const employeeFile = args["--employees"]
    if (employeeFile) {
        dispatcher.addEmployee(await getEmployeesFromFile(employeeFile))
    }

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