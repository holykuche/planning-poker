import { Subscription } from "rxjs";
import { CallbackQuery } from "node-telegram-bot-api";
import AbstractTelegramBotSubscription from "./AbstractTelegramBotSubscription";

export default abstract class AbstractTelegramBotCallbackQuerySubscription extends AbstractTelegramBotSubscription<CallbackQuery> {

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async callbackQuery => {
                try {
                    await this.handle(callbackQuery);
                } catch (error) {
                    await this.handleError(callbackQuery, error);
                } finally {
                    await this.bot?.answerCallbackQuery(callbackQuery.id);
                }
            });
    }

    protected getChatId(callbackQuery: CallbackQuery): number {
        return callbackQuery.message.chat.id;
    }
}