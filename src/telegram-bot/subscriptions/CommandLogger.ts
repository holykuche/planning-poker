import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { CallbackQuery } from "node-telegram-bot-api";

import { formatTelegramUserName } from "../utils";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class CommandLogger extends TelegramBotSubscription<CallbackQuery> {
    constructor(callbacks$: Observable<CallbackQuery>) {
        super(callbacks$);
    }

    subscribe(): Subscription {
        return this.observable$
            .pipe(
                map(CommandLogger.formatCallback)
            )
            .subscribe(console.log);
    }

    private static formatCallback(callback: CallbackQuery): string {
        return `[INFO] ${formatTelegramUserName(callback.from)} [ ${callback.from.id} ]: ${callback.data}`;
    }
}