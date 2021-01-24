import Call, { Severity } from "./Call"

// Time is in seconds.
export default class CallGenerator {
    // minimum and maximum duration in seconds before the next call
    #minTime = 10
    #maxTime = 20

    // Ratio of calls that are considered high severity. Higher means more high severity calls
    #severityRatio = 0.25

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

    generateNewCall(): Call {
        const callDuration = getRandomInRange(this.#minCallLength, this.#maxCallLength)
        const severity = (Math.random() + this.#severityRatio < 1) ? Severity.Low : Severity.High
        const call = new Call(callDuration, severity);

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
}

function getRandomInRange(min = 0, max = 1) {
    return (Math.random() * (max - min)) + min
}