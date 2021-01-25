export enum Severity {
    Low,
    High,
}


export default class Call {
    #duration: number // Call duration in seconds.
    #severity: Severity
    

    constructor(length: number, severity = Severity.Low) {
        this.#duration = length
        this.#severity = severity
    }

    get severity() {
        return this.#severity
    }
}