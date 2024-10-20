import {injectable, inject} from 'inversify';
import {CallbackQuery} from 'node-telegram-bot-api';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

import {MemberService, SERVICE_TYPES, TelegramUserService} from '@/service/api';

import {TELEGRAM_BOT_TYPES} from '../bot';
import {ButtonCommand} from '../enum';

import AbstractCallbackQuerySubscription from './AbstractCallbackQuerySubscription';

@injectable()
export default class RemoveCardSubscription extends AbstractCallbackQuerySubscription {
  @inject(SERVICE_TYPES.TelegramUserService)
  private readonly telegramUserService: TelegramUserService;

  @inject(SERVICE_TYPES.MemberService)
  private readonly memberService: MemberService;

  constructor(
    @inject(TELEGRAM_BOT_TYPES.CallbackQueries$)
    callbackQueries$: Observable<CallbackQuery>
  ) {
    super(
      callbackQueries$.pipe(
        filter(callback => callback.data === ButtonCommand.RemoveCard)
      )
    );
  }

  protected async handle(callbackQuery: CallbackQuery): Promise<void> {
    const member = await this.telegramUserService.getMemberByTelegramUserId(
      callbackQuery.from.id
    );
    await this.memberService.removeCard(member.id!);
  }
}
