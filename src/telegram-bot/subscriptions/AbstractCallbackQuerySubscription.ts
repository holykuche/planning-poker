import { Subscription } from "rxjs";
import { CallbackQuery } from "node-telegram-bot-api";
import AbstractSubscription from "./AbstractSubscription";

export default abstract class AbstractCallbackQuerySubscription extends AbstractSubscription<CallbackQuery> {

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