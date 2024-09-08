import {injectable, inject} from 'inversify';
import TelegramBot, {InlineKeyboardButton} from 'node-telegram-bot-api';
import {Observable, Subscription} from 'rxjs';

import {CardCode} from '@/grpc-client/enum';
import {ServiceError} from '@/service/error';

import {TELEGRAM_BOT_TYPES} from '../bot';
import {ButtonCommand} from '../enum';
import {
  inlineKeyboardButtonFactory,
  formatWarning,
  formatError,
} from '../utils';

@injectable()
export default abstract class AbstractSubscription<T> {
  protected static readonly PARSE_MODE = 'MarkdownV2';
  protected static readonly INLINE_KEYBOARD: Record<
    ButtonCommand,
    InlineKeyboardButton[][]
  > = {
    [ButtonCommand.Leave]: [[inlineKeyboardButtonFactory(ButtonCommand.Leave)]],
    [ButtonCommand.PutCard]: [
      [
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score0),
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score1),
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score2),
      ],
      [
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score3),
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score5),
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score8),
      ],
      [
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score13),
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score20),
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score40),
      ],
      [
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.DontKnow),
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score100),
        inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Skip),
      ],
    ],
    [ButtonCommand.RemoveCard]: [
      [inlineKeyboardButtonFactory(ButtonCommand.RemoveCard)],
    ],
  };

  @inject(TELEGRAM_BOT_TYPES.TelegramBot)
  protected readonly bot: TelegramBot;

  protected readonly observable$: Observable<T>;

  constructor(observable$: Observable<T>) {
    this.observable$ = observable$;
  }

  abstract subscribe(): Subscription;

  protected abstract handle(item: T): Promise<void>;

  protected abstract getChatId(item: T): number;

  protected async handleError(error: unknown, item?: T): Promise<void> {
    if (error instanceof ServiceError) {
      const warningMessage = await this.bot.sendMessage(
        this.getChatId(item),
        formatWarning(formatError(error)),
        {
          parse_mode: AbstractSubscription.PARSE_MODE,
        }
      );
      setTimeout(
        async () =>
          await this.bot.deleteMessage(
            this.getChatId(item),
            String(warningMessage.message_id)
          ),
        5000
      );
    }
    if (error instanceof Error) {
      console.log(`[ERROR]: ${error.message}`);
    }
  }
}
