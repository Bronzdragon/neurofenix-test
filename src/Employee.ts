import prompts from "prompts"
import Call from "./Call"

export enum EmployeeRank {
    junior,
    senior,
    manager,
    director
}

export enum Availability {
    free,
    inCall,
    away
}

export default class Employee {
    id: number
    name: string
    rank: EmployeeRank

    #status = Availability.free
    #currentCall: Call | null = null

    constructor(name: string, rank: EmployeeRank, id: number = getNextId()) {
        this.id = id
        this.name = name
        this.rank = rank
    }

    available() {
        return this.#status === Availability.free
    }

    takeCall(call: Call) {
        if (!this.available()) {
            throw new Error("Cannot assign a call, this employee is not available.")
        }

        this.#status = Availability.inCall
        this.#currentCall = call
    }

    setAway(isAway: boolean) {
        if (this.#status === Availability.inCall) {
            throw new Error("Cannot toggle status while in a call!")
        }

        this.#status = isAway ? Availability.away : Availability.free
    }
}

type EmployeePromptType = {
    id: number,
    rank: keyof typeof EmployeeRank,
    name: string
}

export async function promptForEmployee(): Promise<Employee> {
    const questions = [
        {
            type: 'text' as const,
            name: 'name',
            message: "What is the employee's name?"
        },
        {
            type: 'select' as const,
            name: 'rank',
            message: 'What rank is this employee?',
            choices: [
                { title: 'Junior', value: 'junior' },
                { title: 'Senior', value: 'senior' },
                { title: 'Manager', value: 'manager' },
                { title: 'Director', value: 'director' },
            ],
        },
        {
            type: 'number' as const,
            name: 'id',
            message: 'What ID should the employee have?',
            initial: currentId + 1
        }
    ];

    let { name, rank, id } = await prompts(questions) as EmployeePromptType

    currentId = Math.max(currentId, id)
    console.log("id: ", id)
    console.log("Name: ", name)
    console.log("Rank: ", rank)

    return new Employee(name, EmployeeRank[rank], id)
}

let currentId = 0;
function getNextId() {
    return currentId++;
}
