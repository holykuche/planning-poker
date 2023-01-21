import { Observable, Subscription } from "rxjs";
import TelegramBot, { Message } from "node-telegram-bot-api";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class DeleteMessageSubscription extends TelegramBotSubscription<Message> {

    constructor(messages$: Observable<Message>, bot?: TelegramBot) {
        super(messages$, bot);
    }

    subscribe(): Subscription {
        return this.observable$
            .subscribe(msg => this.bot.deleteMessage(msg.chat.id, String(msg.message_id)));
    }

}