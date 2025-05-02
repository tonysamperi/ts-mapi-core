export class SmpFilterException extends Error {

    constructor(public message: string = "Filter Exception", public data?: any) {
        super();
    }
}
