import "reflect-metadata";
import { container } from "inversify.config";

import { TELEGRAM_SERVICE_TYPES, TelegramDataService } from "../api";
import TelegramDataServiceImpl from "./TelegramDataServiceImpl";

container.bind<TelegramDataService>(TELEGRAM_SERVICE_TYPES.TelegramDataService).to(TelegramDataServiceImpl);
