import {CallbackQuery} from 'node-telegram-bot-api';
import {Subscription} from 'rxjs';

import AbstractSubscription from './AbstractSubscription';

export default abstract class AbstractCallbackQuerySubscription extends AbstractSubscription<CallbackQuery> {
  subscribe(): Subscription {
    return this.observable$.subscribe(async callbackQuery => {
      try {
        await this.handle(callbackQuery);
      } catch (error: unknown) {
        await this.handleError(error, callbackQuery);
      } finally {
        await this.bot?.answerCallbackQuery(callbackQuery.id);
      }
    });
  }

  protected getChatId(callbackQuery: CallbackQuery): number {
    return callbackQuery.message.chat.id;
  }
}
