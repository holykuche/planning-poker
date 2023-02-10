import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { Message } from "node-telegram-bot-api";

import { formatTelegramUserName } from "../utils";
import { TELEGRAM_BOT_TYPES } from "../bot";

import MessageSubscriptionTemplate from "./MessageSubscriptionTemplate";

@injectable()
export default class PlainTextLogger extends MessageSubscriptionTemplate {

    constructor(@inject(TELEGRAM_BOT_TYPES.PlaintTexts$) plainTexts$: Observable<Message>) {
        super(plainTexts$);
    }

    protected handle(msg: Message): Promise<void> {
        console.log(PlainTextLogger.format(msg));
        return Promise.resolve();
    }

    private static format(msg: Message): string {
        return `[INFO] ${ formatTelegramUserName(msg.from) } [ ${ msg.from.id } ] have typed message '${ msg.text }'`;
    }
}
