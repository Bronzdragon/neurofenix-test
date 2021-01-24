import asTable from "as-table";
import Call from "./Call";
import Employee from "./Employee";
import EmployeeContainer from "./EmployeeContainer";

export default class Dispatcher {
    #container = new EmployeeContainer()
    #callQueue: Call[] = []

    constructor() { }

    addEmployee(arg: Employee | Employee[]) {
        this.#container.addEmployee(arg)
    }

    removeEmployee(arg: Employee | Employee[]) {
        this.#container.removeEmployee(arg)
    }

    hasEmployees() {
        return this.#container.length > 0
    }

    printEmployees(): string {
        return this.#container.print()
    }

    get allEmployees(): Employee[] {
        return this.#container.allEmployees
    }
}