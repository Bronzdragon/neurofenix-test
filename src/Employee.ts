import prompts from "prompts"
import Call from "./Call"

enum EmployeeRank {
    Junior,
    Senior,
    Manager,
    Director
}

enum Availability {
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

    constructor(name: string, rank: EmployeeRank, id?: number) {
        this.id = id ?? getNextId()
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

const stringToRankMap = {
    "Junior": EmployeeRank.Junior,
    "Senior": EmployeeRank.Senior,
    "Manager": EmployeeRank.Manager,
    "Director": EmployeeRank.Director,
} as const


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
                { title: 'Junior', value: 'Junior' },
                { title: 'Senior', value: 'Senior' },
                { title: 'Manager', value: 'Manager' },
                { title: 'Director', value: 'Director' },
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
    console.log("id: ", id)
    console.log("Name: ", name)
    console.log("Rank: ", rank)

    return new Employee(name, EmployeeRank[rank], id)
}

let currentId = 0;
function getNextId() {
    return currentId++;
}
