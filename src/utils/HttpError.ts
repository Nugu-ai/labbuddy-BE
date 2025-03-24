export class HttpError extends Error {
    statusCode: number;
    code: number;

    constructor(statusCode: number, code: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;

        Object.setPrototypeOf(this, HttpError.prototype);
    }
}
