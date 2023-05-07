import "reflect-metadata";
import { injectable } from "inversify";

import { TimeoutScheduler } from "../api";
import { TaskType } from "../enum";

@injectable()
export default class TimeoutSchedulerImpl implements TimeoutScheduler {

    private taskTimeoutIds = {
        [ TaskType.Lobby ]: new Map<number, NodeJS.Timeout>(),
    };

    schedule(taskType: TaskType, id: number, seconds: number, task: () => void): void {
        clearTimeout(this.taskTimeoutIds[ taskType ].get(id));

        const timeoutId = setTimeout(() => {
            this.taskTimeoutIds[ taskType ].delete(id);
            task();
        }, seconds * 1000);

        this.taskTimeoutIds[ taskType ].set(id, timeoutId);
    }

    cancel(taskType: TaskType, id: number): void {
        clearTimeout(this.taskTimeoutIds[ taskType ].get(id));
        this.taskTimeoutIds[ taskType ].delete(id);
    }
}
