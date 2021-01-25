export enum Severity {
    Low,
    High,
}

export enum CallEvent {
    SeverityUpgrade,
    End
}


export default class Call {
    #duration: number // Call duration in seconds.
    #severity: Severity

    #timerHandle?: ReturnType<typeof setTimeout>

    #severityListeners: Array<() => void> = []
    #endListeners: Array<() => void> = []
    shouldUpgrade: boolean

    constructor(length: number, severity = Severity.Low, upgrade = false) {
        this.#duration = length
        this.#severity = severity
        this.shouldUpgrade = upgrade
    }

    get severity() {
        return this.#severity
    }

    addListener(event: CallEvent, listener: () => void) {
        if (event === CallEvent.SeverityUpgrade) {
            this.#severityListeners.push(listener)
        } else if (event === CallEvent.End) {
            this.#endListeners.push(listener)
        }
    }

    start() {
        if (this.shouldUpgrade) {
            const timeToUpgrade = getRandomInRange(0, this.#duration)
            setTimeout(() => {
                this.shouldUpgrade = false
                this.#severity = Severity.High
                for (const callback of this.#severityListeners) {
                    callback()
                }
            }, timeToUpgrade * 1000)
        }

        this.#timerHandle = setTimeout(() => {
            for (const callback of this.#endListeners) {
                callback()
            }
        }, this.#duration * 1000)
    }

    stop() {
        if (this.#timerHandle) {
            clearTimeout(this.#timerHandle)
        }
    }
}

function getRandomInRange(min = 0, max = 1) {
    return (Math.random() * (max - min)) + min
}