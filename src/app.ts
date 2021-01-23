import arg from "arg"
import { exit } from "process";
import { promptForEmployee } from "./Employee";

const args = arg({
    // Types
    '--help': Boolean,
    '--employees': String,

    // Aliases
    '-e': '--employees',
    '-h': '--help',
});

if(args["--help"]){
    // display help
    console.log('Usage: call-router [--employees <employee_file>]')
    exit(0);
}

const employeeFile = args["--employees"]

promptForEmployee()
    .then(console.log)



//console.log(`You want to load employees from '${args["--employees"]}'.`)
// readFile(employeeFile ?? "", 'utf8')
//     .then(JSON.parse)
//     .then(data => console.log(data))saf