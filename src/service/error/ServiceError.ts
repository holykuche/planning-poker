export default abstract class ServiceError extends Error {

    protected constructor(message?: string) {
        super(message);
    }

    abstract getUserMessage(): string;
}
