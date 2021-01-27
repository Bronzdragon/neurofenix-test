import prompts from "prompts"
import Call, { CallEvent } from "./Call"

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

export enum EmployeeEvent {
    Reject,
    End
}

export default class Employee {
    id: number
    name: string
    rank: EmployeeRank

    #rejectCallListeners: Array<(call: Call) => void> = []
    #endCallListeners: Array<(call: Call) => void> = []

    #status = Availability.free
    #currentCall: Call | null = null
    #lastInCall: Date | null = null

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
            return this.rejectCall(call)
        }

        this.#status = Availability.inCall
        this.#currentCall = call

        call.addListener(CallEvent.SeverityUpgrade, () => {
            if (this.rank !== EmployeeRank.manager && this.rank !== EmployeeRank.director) {
                // This means we're not of the correct rank to take this call.
                this.rejectCall(call)
            }
        })

        call.addListener(CallEvent.End, () => {
            this.endCall()
        })

        call.start()
    }

    setAway(isAway: boolean) {
        if (this.#status === Availability.inCall) {
            throw new Error("Cannot toggle status while in a call!")
        }

        this.#status = isAway ? Availability.away : Availability.free
    }

    get statusText() {
        switch (this.#status) {
            case Availability.free:
                return "Available"
            case Availability.inCall:
                return "In a call"
            case Availability.away:
                return "Away"
            default:
                return ''
        }
    }

    get lastInCall() {
        return this.#lastInCall
    }

    private rejectCall(call: Call) {
        call.stop()
        for (const callback of this.#rejectCallListeners) {
            callback(call)
        }

        this.#status = Availability.free
        this.#currentCall = null
        this.#lastInCall = new Date()
    }

    private endCall() {
        if(!this.#currentCall){ return }
        this.#currentCall.stop()

        for (const callback of this.#endCallListeners) {
            callback(this.#currentCall)
        }

        this.#status = Availability.free
        this.#currentCall = null
        this.#lastInCall = new Date()
    }

    addListener(eventType: EmployeeEvent, listener: (call: Call) => void) {
        const queue = eventType === EmployeeEvent.End ? this.#endCallListeners : this.#rejectCallListeners
        queue.push(listener)
    }

    removeListener(eventType: EmployeeEvent, listener: (call: Call) => void) {
        const queue = eventType === EmployeeEvent.End ? this.#endCallListeners : this.#rejectCallListeners
        queue.splice(this.#rejectCallListeners.indexOf(listener), 1)
    }
}

type EmployeePromptType = {
    id?: number,
    rank?: keyof typeof EmployeeRank,
    name?: string
}

export async function promptForEmployee(): Promise<Employee|null> {
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

    const { name, rank, id }: EmployeePromptType = await prompts(questions)
    // If the user cancels with ctrl+c, these values would end up as undefined.
    if(!name || !rank || !id) return null;

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
