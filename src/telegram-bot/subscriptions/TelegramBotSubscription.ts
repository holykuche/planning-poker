import { Observable, Subscription } from "rxjs";
import TelegramBot, { Message } from "node-telegram-bot-api";

export default abstract class TelegramBotSubscription {

    protected constructor(protected readonly messages$: Observable<Message>,
                          protected readonly bot?: TelegramBot) {}

    abstract subscribe(): Subscription;
}

export interface TelegramBotSubscriptionConstructor {
    new(messages$: Observable<Message>, bot: TelegramBot): TelegramBotSubscription;
}
