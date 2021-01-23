import arg from "arg"
import prompts from "prompts"
import { readFile } from "fs/promises";
import { exit } from "process";

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

if(!employeeFile) {
    prompts({
        type: 'confirm',
        name: 'empoyeePath',
        message: "You didn't specify a path to an employee file. Add some now?"
    })
}

//console.log(`You want to load employees from '${args["--employees"]}'.`)
// readFile(employeeFile ?? "", 'utf8')
//     .then(JSON.parse)
//     .then(data => console.log(data))