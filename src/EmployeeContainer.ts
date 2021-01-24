import asTable from "as-table";
import Employee, { EmployeeRank } from "./Employee";

const employeeRankOrder = [EmployeeRank.junior, EmployeeRank.senior, EmployeeRank.manager, EmployeeRank.director]

export default class EmployeeContainer {
    #employees: Employee[]
    constructor(initialEmployees: Employee[] = []) {
        this.#employees = [...initialEmployees]
    }

    addEmployee(employees: Employee | Employee[]) {
        if (Array.isArray(employees)) {
            this.#employees = this.#employees.concat(employees)
        } else {
            this.#employees.push(employees)
        }
    }

    removeEmployee(employees: Employee | Employee[]) {
        if (!Array.isArray(employees)) {
            employees = [employees]
        }

        for (const person of employees) {
            this.#employees.splice(this.#employees.indexOf(person), 1)
        }
    }

    getAvailableEmpoyee(minRank: EmployeeRank): Employee | null {
        let availableEmployees = this.#employees.filter(employee => employee.available() && employee.rank === minRank)

        if (availableEmployees.length < 1) {
            const nextIndex = employeeRankOrder.indexOf(minRank) + 1
            if (nextIndex >= employeeRankOrder.length) {
                return null; // no available employees.
            }

            // Upgrade rank and try to find one.
            return this.getAvailableEmpoyee(employeeRankOrder[nextIndex])
        }

        // Get a random available employee.
        return availableEmployees[Math.floor(Math.random() * availableEmployees.length)]
    }

    get length() {
        return this.#employees.length
    }

    get allEmployees(): Employee[] {
        return [...this.#employees]
    }

    print() {
        return asTable(
            this.#employees.map(employee => [
                employee.name,
                capitalizeFirstLetter(EmployeeRank[employee.rank]),
                employee.statusText
            ])
        )
    }
}

function capitalizeFirstLetter(input: string) {
    const [firstLetter, ...otherLetters] = input
    return firstLetter.toLocaleUpperCase() + otherLetters.join('').toLocaleLowerCase()
}