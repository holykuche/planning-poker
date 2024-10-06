import {injectable, inject} from 'inversify';
import {Message} from 'node-telegram-bot-api';
import {Observable} from 'rxjs';

import {TELEGRAM_BOT_TYPES} from '../bot';
import {formatTelegramUserName} from '../utils';

import AbstractMessageSubscription from './AbstractMessageSubscription';

@injectable()
export default class PlainTextLogger extends AbstractMessageSubscription {
  constructor(
    @inject(TELEGRAM_BOT_TYPES.PlaintTexts$) plainTexts$: Observable<Message>
  ) {
    super(plainTexts$);
  }

  protected async handle(msg: Message): Promise<void> {
    console.log(PlainTextLogger.format(msg));
  }

  private static format(msg: Message): string {
    return `[INFO] ${formatTelegramUserName(msg.from)} [ ${msg.from.id} ] have typed message '${msg.text}'`;
  }
}
