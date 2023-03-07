import "reflect-metadata";
import { container } from "inversify.config";

import { TELEGRAM_SERVICE_TYPES, TelegramMessageService, TelegramUserService } from "../api";
import TelegramMessageServiceImpl from "./TelegramMessageServiceImpl";
import TelegramUserServiceImpl from "./TelegramUserServiceImpl";

container.bind<TelegramMessageService>(TELEGRAM_SERVICE_TYPES.TelegramMessageService).to(TelegramMessageServiceImpl);
container.bind<TelegramUserService>(TELEGRAM_SERVICE_TYPES.TelegramUserService).to(TelegramUserServiceImpl);
