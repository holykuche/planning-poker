import "reflect-metadata";
import { container } from "inversify.config";

import CONFIG_TYPES from "./types";

container.bind<string>(CONFIG_TYPES.TelegramBotApiToken).toConstantValue(TELEGRAM_BOT_API_TOKEN);
container.bind<number>(CONFIG_TYPES.LobbyLifetimeMs).toConstantValue(LOBBY_LIFETIME_MS);
