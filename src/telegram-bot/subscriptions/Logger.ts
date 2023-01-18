import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { Message } from "node-telegram-bot-api";

import { formatTelegramUserName } from "../utils";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class Logger extends TelegramBotSubscription {

    constructor(messages$: Observable<Message>) {
        super(messages$);
    }

    subscribe(): Subscription {
        return this.messages$
            .pipe(
                map(Logger.formatMsg)
            )
            .subscribe(console.log);
    }

    private static formatMsg(msg: Message): string {
        return `${formatTelegramUserName(msg.from)} [ ${msg.from.id} ]: ${msg.text}`;
    }
}
