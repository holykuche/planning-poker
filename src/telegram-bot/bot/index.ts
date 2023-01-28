import { Observable } from "rxjs";
import TelegramBot, { Message, CallbackQuery } from "node-telegram-bot-api";

import { container } from "inversify.config";

import bot from "./bot";
import { messages$, plainTexts$, commands$, callbackQueries$ } from "./observables";
import TELEGRAM_BOT_TYPES from "./types";

container.bind<TelegramBot>(TELEGRAM_BOT_TYPES.TelegramBot).toConstantValue(bot);
container.bind<Observable<Message>>(TELEGRAM_BOT_TYPES.Messages$).toConstantValue(messages$);
container.bind<Observable<Message>>(TELEGRAM_BOT_TYPES.PlaintTexts$).toConstantValue(plainTexts$);
container.bind<Observable<Message>>(TELEGRAM_BOT_TYPES.Commands$).toConstantValue(commands$);
container.bind<Observable<CallbackQuery>>(TELEGRAM_BOT_TYPES.CallbackQueries$).toConstantValue(callbackQueries$);

export { TELEGRAM_BOT_TYPES };