import "reflect-metadata";
import { container } from "config/inversify";

import { SCHEDULER_TYPES, TimeoutScheduler } from "../api";
import TimeoutSchedulerImpl from "./TimeoutSchedulerImpl";

container.bind<TimeoutScheduler>(SCHEDULER_TYPES.TimeoutScheduler).to(TimeoutSchedulerImpl);
