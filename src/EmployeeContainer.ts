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
        const availableEmployees = this.#employees.filter(employee => employee.available() && employee.rank === minRank)

        if (availableEmployees.length < 1) {
            const nextIndex = employeeRankOrder.indexOf(minRank) + 1
            if (nextIndex >= employeeRankOrder.length) {
                return null; // no available employees.
            }

            // Upgrade rank and try to find one.
            return this.getAvailableEmpoyee(employeeRankOrder[nextIndex])
        }

        // Sort employees by longest not in a call.
        availableEmployees.sort((a, b) => {
            if(!a.lastInCall) return -1
            if(!b.lastInCall) return 1
            return a.lastInCall.getTime() - b.lastInCall.getTime()
        })
        
        return availableEmployees[0]
    }

    get length() {
        return this.#employees.length
    }

    get allEmployees(): Employee[] {
        return [...this.#employees]
    }

    print() {
        return asTable.configure({ delimiter: ' | ' })(
            this.#employees.map(employee => ({
                Name: employee.name,
                Rank: capitalizeFirstLetter(EmployeeRank[employee.rank]),
                Status: employee.statusText,
            }))
        )
    }
}

function capitalizeFirstLetter(input: string) {
    const [firstLetter, ...otherLetters] = input
    return firstLetter.toLocaleUpperCase() + otherLetters.join('').toLocaleLowerCase()
}