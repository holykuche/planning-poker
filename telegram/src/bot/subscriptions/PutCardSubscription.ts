import {injectable, inject} from 'inversify';
import {CallbackQuery} from 'node-telegram-bot-api';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

import {CardCode} from '@/grpc-client/enum';
import {MemberService, SERVICE_TYPES, TelegramUserService} from '@/service/api';

import {TELEGRAM_BOT_TYPES} from '../bot';

import AbstractCallbackQuerySubscription from './AbstractCallbackQuerySubscription';

@injectable()
export default class PutCardSubscription extends AbstractCallbackQuerySubscription {
  private static readonly PUT_CARD_COMMAND_REGEXP =
    /^\/put_card (Score(0|1|2|3|5|8|13|20|40|100)|DontKnow|Skip)$/;

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
        filter(callback =>
          PutCardSubscription.PUT_CARD_COMMAND_REGEXP.test(callback.data!)
        )
      )
    );
  }

  protected async handle(callbackQuery: CallbackQuery): Promise<void> {
    const cardCode = callbackQuery.data!.match(
      PutCardSubscription.PUT_CARD_COMMAND_REGEXP
    )![1] as CardCode;
    const member = await this.telegramUserService.getMemberByTelegramUserId(
      callbackQuery.from.id
    );
    await this.memberService.putCard(member.id!, cardCode);
  }
}
