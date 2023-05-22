import { Subscription } from "rxjs";
import { Message } from "node-telegram-bot-api";
import AbstractSubscription from "./AbstractSubscription";

export default abstract class AbstractMessageSubscription extends AbstractSubscription<Message> {

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async message => {
                try {
                    await this.handle(message);
                } catch (error: unknown) {
                    await this.handleError(error, message);
                }
            });
    }

    protected getChatId(message: Message): number {
        return message.chat.id;
    }
}