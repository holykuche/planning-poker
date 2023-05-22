import "reflect-metadata";
import { container } from "config/inversify";

import {
    TelegramMessageDAO,
    TelegramUserDAO,
    DAO_TYPES,
} from "../api";

import TelegramMessageDAOImpl from "./TelegramMessageDAOImpl";
import TelegramUserDAOImpl from "./TelegramUserDAOImpl";

container.bind<TelegramMessageDAO>(DAO_TYPES.TelegramMessageDAO).to(TelegramMessageDAOImpl);
container.bind<TelegramUserDAO>(DAO_TYPES.TelegramUserDAO).to(TelegramUserDAOImpl);
