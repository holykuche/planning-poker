import ErrorType from "./ErrorType";

export default abstract class ServiceError extends Error {

    readonly errorType: ErrorType;

    protected constructor(errorType: ErrorType, message?: string) {
        super(message);
        this.errorType = errorType;
    }
}
