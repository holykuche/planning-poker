import { Subscription } from "rxjs";
import { Message } from "node-telegram-bot-api";
import AbstractTelegramBotSubscription from "./AbstractTelegramBotSubscription";

export default abstract class AbstractTelegramBotMessageSubscription extends AbstractTelegramBotSubscription<Message> {

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