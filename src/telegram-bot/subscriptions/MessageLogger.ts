import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { Message } from "node-telegram-bot-api";

import { formatTelegramUserName } from "../utils";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class MessageLogger extends TelegramBotSubscription<Message> {

    constructor(messages$: Observable<Message>) {
        super(messages$);
    }

    subscribe(): Subscription {
        return this.observable$
            .pipe(
                map(MessageLogger.formatMsg)
            )
            .subscribe(console.log);
    }

    private static formatMsg(msg: Message): string {
        return `[INFO] ${formatTelegramUserName(msg.from)} [ ${msg.from.id} ]: ${msg.text}`;
    }
}
