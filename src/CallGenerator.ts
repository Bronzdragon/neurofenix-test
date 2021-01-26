import { format } from "path"
import prompts, { prompt } from "prompts"
import Call, { Severity } from "./Call"

// Time is in seconds.
export default class CallGenerator {
    // minimum and maximum duration in seconds before the next call
    #minTime = 10
    #maxTime = 20

    // Ratio of calls that are considered high severity. Higher means more high severity calls
    #severityRatio = 0.25
    // Ratio of low-priority calls that should upgrade over their lifetime.
    #upgradeRatio = 0.25

    // minimum and maximum length in seconds of a call.
    #minCallLength = 15
    #maxCallLength = 60

    #callbacks: Array<(newCall: Call) => void> = []

    #lastCall = new Date()
    #timer?: ReturnType<typeof setTimeout>

    constructor() {
        this.setTimer()
    }

    private getNextCallTime(): Date {
        const durationUntilNext = getRandomInRange(this.#minTime, this.#maxTime)
        return new Date(this.#lastCall.getTime() + durationUntilNext * 1000)
    }

    generateNewCall(newSeverity?: Severity): Call {
        const callDuration = getRandomInRange(this.#minCallLength, this.#maxCallLength)
        const severity = newSeverity ?? ((Math.random() + this.#severityRatio < 1) ? Severity.Low : Severity.High)
        const shouldUpgrade = severity === Severity.Low && (Math.random() + this.#upgradeRatio > 1)
        const call = new Call(callDuration, severity, shouldUpgrade);

        for (const callback of this.#callbacks) {
            callback(call)
        }

        this.#lastCall = new Date()


        return call
    }

    setTimer() {
        const nextTime = this.getNextCallTime()

        this.#timer = setTimeout(() => {
            this.generateNewCall()
            this.setTimer() // repeat.
        }, nextTime.getTime() - new Date().getTime());
    }

    stopTimer() {
        if (this.#timer) {
            clearTimeout(this.#timer)
        }
        this.#timer = undefined
    }

    addListener(callback: (newCall: Call) => void) {
        this.#callbacks.push(callback)
    }

    removeListener(callback: (newCall: Call) => void) {
        this.#callbacks.splice(this.#callbacks.indexOf(callback), 1)
    }

    // Adjust the time between calls
    async promptTime() {
        const { min, max } = await prompts([{
            type: 'number',
            name: 'min',
            message: 'Minimum amount of time between calls?',
            increment: 5,
            initial: this.#minTime,
        }, {
            type: 'number',
            name: 'max',
            message: 'Maxium amount of time between calls?',
            increment: 5,
            initial: this.#maxTime,
        }])
        if (!min || !max || min > max) {
            return
        }

        this.#minTime = min
        this.#maxTime = max
    }

    // Adjust the length between calls
    async promptLength() {
        const { min, max } = await prompts([{
            type: 'number',
            name: 'min',
            message: 'Minimum call length?',
            increment: 5,
            initial: this.#minTime,
        }, {
            type: 'number',
            name: 'max',
            message: 'Maxium call length?',
            increment: 5,
            initial: this.#maxTime,
        }])
        if (!min || !max || min > max) {
            return
        }

        this.#minTime = min
        this.#maxTime = max
    }

    // Ajust the severity ratio of new calls
    async promptSeverity() {
        const { value }: { value: number } = await prompts({
            type: 'number',
            name: 'value',
            message: "Percentage of calls that start out as high severity?",
            initial: this.#severityRatio * 100,
        })

        if (!value) { return }

        this.#severityRatio = value / 100
    }

    // Adjust the likeyhood a low severity call needs to be upgraded
    async promptUpgrade() {
        const { value }: { value: number } = await prompts({
            type: 'number',
            name: 'value',
            message: "Percentage of low priority calls that will need an upgrade during their lifetime?",
            initial: this.#upgradeRatio * 100,
        })

        if (!value) { return }

        this.#upgradeRatio = value / 100
    }

    async promptGenerateCalls(): Promise<Call[]> {
        const { low, high }: { low: number, high: number } = await prompts([{
            type: 'number',
            name: 'low',
            message: "How many low priority calls would you like to generate?",
        }, {
            type: 'number',
            name: 'high',
            message: "How many high priority calls would you like to generate?",
        }])
        const callsToReturn: Call[] = []

        for (let i = 0; i < low; i++) {
            callsToReturn.push(this.generateNewCall(Severity.Low))
        }

        for (let i = 0; i < high; i++) {
            callsToReturn.push(this.generateNewCall(Severity.High))
        }

        return callsToReturn
    }
}

function getRandomInRange(min = 0, max = 1) {
    return (Math.random() * (max - min)) + min
}