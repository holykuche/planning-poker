import { TaskType } from "../enum";

export default interface TimeoutScheduler {
    schedule(taskType: TaskType, id: number, seconds: number, task: () => void): void;

    cancel(taskType: TaskType, id: number): void;
}
