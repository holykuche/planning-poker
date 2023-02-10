import { Subscription } from "rxjs";
import { Message } from "node-telegram-bot-api";
import AbstractSubscriptionTemplate from "./AbstractSubscriptionTemplate";

export default abstract class MessageSubscriptionTemplate extends AbstractSubscriptionTemplate<Message> {

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async message => {
                try {
                    await this.handle(message);
                } catch (error) {
                    await this.handleError(message, error);
                }
            });
    }

    protected getChatId(message: Message): number {
        return message.chat.id;
    }
}