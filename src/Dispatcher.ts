import Call, { Severity } from "./Call";
import Employee, { EmployeeRank } from "./Employee";
import EmployeeContainer from "./EmployeeContainer";

export default class Dispatcher {
    #container = new EmployeeContainer()
    #callQueue: Call[] = []

    constructor() { }

    dispatchCall(call: Call) {
        this.#callQueue.push(call)

        for (const call of this.#callQueue) {
            const desiredRank = call.severity === Severity.Low ? EmployeeRank.junior : EmployeeRank.manager
            const employee = this.#container.getAvailableEmpoyee(desiredRank)
            if (!employee) { continue; }

            employee.takeCall(call)
            this.dropCall(call)
        }
    }

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

    dropCall(call: Call) {
        return this.#callQueue.splice(this.#callQueue.indexOf(call), 1)
    }

    get allEmployees(): Employee[] {
        return this.#container.allEmployees
    }
}