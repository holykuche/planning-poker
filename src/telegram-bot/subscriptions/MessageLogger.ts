import { Observable } from "rxjs";
import { Message } from "node-telegram-bot-api";

import { formatTelegramUserName } from "../utils";
import AbstractTelegramBotMessageSubscription from "./AbstractTelegramBotMessageSubscription";

export default class MessageLogger extends AbstractTelegramBotMessageSubscription {

    constructor(messages$: Observable<Message>) {
        super(messages$);
    }

    protected handle(msg: Message): Promise<void> {
        console.log(MessageLogger.format(msg));
        return Promise.resolve();
    }

    private static format(msg: Message): string {
        return `[INFO] ${formatTelegramUserName(msg.from)} [ ${msg.from.id} ]: ${msg.text}`;
    }
}
