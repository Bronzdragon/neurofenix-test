import Employee from "./Employee";
import EmployeeContainer from "./EmployeeContainer";

export default class Dispatcher {
    #container = new EmployeeContainer()
    constructor() {
        
    }

    addEmployee(arg: Employee|Employee[]) {
        this.#container.addEmployee(arg)
    }

    hasEmployees() {
        return this.#container.length > 0
    }
}