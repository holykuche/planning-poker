import {injectable, inject} from 'inversify';
import {Message} from 'node-telegram-bot-api';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

import {TELEGRAM_BOT_TYPES} from '../bot';

import AbstractMessageSubscription from './AbstractMessageSubscription';

@injectable()
export default class HelpSubscription extends AbstractMessageSubscription {
  private static readonly HELP_COMMAND_REGEXP = /^\/(help)|(start)$/;
  private static readonly HELP_MESSAGE =
    '_1\\. Enter to lobby_\n' +
    'If you are *not in a lobby* yet, just type *a lobby name* for become a member of that lobby\\.\n\n' +
    '_2\\. Start poker_\n' +
    'If you are already *in a lobby*, just type *a poker theme* for start poker\\. Any member of a lobby can do that\\.\n\n' +
    '_3\\. Leave from lobby_\n' +
    'If you want to *leave from a current lobby*, push button *"Leave"* below lobby info message\\.';

  constructor(
    @inject(TELEGRAM_BOT_TYPES.Commands$) commands$: Observable<Message>
  ) {
    super(
      commands$.pipe(
        filter(msg => HelpSubscription.HELP_COMMAND_REGEXP.test(msg.text))
      )
    );
  }

  protected async handle(msg: Message): Promise<void> {
    await this.bot.sendMessage(msg.chat.id, HelpSubscription.HELP_MESSAGE, {
      parse_mode: HelpSubscription.PARSE_MODE,
    });
  }
}
