import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { Message } from "node-telegram-bot-api";

import { TELEGRAM_BOT_TYPES } from "../bot";

import MessageSubscriptionTemplate from "./MessageSubscriptionTemplate";

@injectable()
export default class DeleteMessageSubscription extends MessageSubscriptionTemplate {

    constructor(@inject(TELEGRAM_BOT_TYPES.Messages$) messages$: Observable<Message>) {
        super(messages$);
    }

    protected async handle(msg: Message): Promise<void> {
        await this.bot.deleteMessage(msg.chat.id, String(msg.message_id));
    }
}