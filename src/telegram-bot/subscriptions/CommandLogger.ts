import { Observable } from "rxjs";
import { CallbackQuery } from "node-telegram-bot-api";

import { formatTelegramUserName } from "../utils";
import AbstractTelegramBotCallbackQuerySubscription from "./AbstractTelegramBotCallbackQuerySubscription";

export default class CommandLogger extends AbstractTelegramBotCallbackQuerySubscription {

    constructor(callbackQueries$: Observable<CallbackQuery>) {
        super(callbackQueries$);
    }

    protected handle(callbackQuery: CallbackQuery): Promise<void> {
        console.log(CommandLogger.format(callbackQuery));
        return Promise.resolve();
    }

    private static format(callbackQuery: CallbackQuery): string {
        return `[INFO] ${formatTelegramUserName(callbackQuery.from)} [ ${callbackQuery.from.id} ]: ${callbackQuery.data}`;
    }
}