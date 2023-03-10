import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { CallbackQuery } from "node-telegram-bot-api";

import { formatTelegramUserName } from "../utils";
import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractCallbackQuerySubscription from "./AbstractCallbackQuerySubscription";

@injectable()
export default class CallbackQueryLogger extends AbstractCallbackQuerySubscription {

    constructor(@inject(TELEGRAM_BOT_TYPES.CallbackQueries$) callbackQueries$: Observable<CallbackQuery>) {
        super(callbackQueries$);
    }

    protected handle(callbackQuery: CallbackQuery): Promise<void> {
        console.log(CallbackQueryLogger.format(callbackQuery));
        return Promise.resolve();
    }

    private static format(callbackQuery: CallbackQuery): string {
        return `[INFO] ${ formatTelegramUserName(callbackQuery.from) } [ ${ callbackQuery.from.id } ] have pushed button '${ callbackQuery.data }'`;
    }
}