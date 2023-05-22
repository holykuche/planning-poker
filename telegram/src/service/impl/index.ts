import "reflect-metadata";
import { container } from "config/inversify";

import { SERVICE_TYPES, TelegramMessageService, TelegramUserService } from "../api";
import TelegramMessageServiceImpl from "./TelegramMessageServiceImpl";
import TelegramUserServiceImpl from "./TelegramUserServiceImpl";

container.bind<TelegramMessageService>(SERVICE_TYPES.TelegramMessageService).to(TelegramMessageServiceImpl);
container.bind<TelegramUserService>(SERVICE_TYPES.TelegramUserService).to(TelegramUserServiceImpl);
