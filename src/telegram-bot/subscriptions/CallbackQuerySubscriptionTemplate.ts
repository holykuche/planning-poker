import { Subscription } from "rxjs";
import { CallbackQuery } from "node-telegram-bot-api";
import AbstractSubscriptionTemplate from "./AbstractSubscriptionTemplate";

export default abstract class CallbackQuerySubscriptionTemplate extends AbstractSubscriptionTemplate<CallbackQuery> {

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