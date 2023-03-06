import "reflect-metadata";
import { container } from "inversify.config";

import {
    TelegramMessageDAO,
    TelegramUserDAO,
    TELEGRAM_DAO_TYPES,
} from "../api";

import TelegramMessageDAOImpl from "./TelegramMessageDAOImpl";
import TelegramUserDAOImpl from "./TelegramUserDAOImpl";

container.bind<TelegramMessageDAO>(TELEGRAM_DAO_TYPES.TelegramMessageDAO).to(TelegramMessageDAOImpl);
container.bind<TelegramUserDAO>(TELEGRAM_DAO_TYPES.TelegramUserDAO).to(TelegramUserDAOImpl);
