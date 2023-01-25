import { Observable } from "rxjs";
import TelegramBot, { Message } from "node-telegram-bot-api";
import AbstractTelegramBotMessageSubscription from "./AbstractTelegramBotMessageSubscription";

export default class DeleteMessageSubscription extends AbstractTelegramBotMessageSubscription {

    constructor(messages$: Observable<Message>, bot?: TelegramBot) {
        super(messages$, bot);
    }

    protected async handle(msg: Message): Promise<void> {
        await this.bot.deleteMessage(msg.chat.id, String(msg.message_id));
    }
}