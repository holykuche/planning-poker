import {inject, injectable} from 'inversify';
import {Message} from 'node-telegram-bot-api';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

import {TelegramMessageType} from '@/data/enum';
import {
  LobbyService,
  MemberService,
  SERVICE_TYPES,
  TelegramMessageService,
  TelegramUserService,
} from '@/service/api';

import {TELEGRAM_BOT_TYPES} from '../bot';

import AbstractMessageSubscription from './AbstractMessageSubscription';

@injectable()
export default class CancelPokerSubscription extends AbstractMessageSubscription {
  @inject(SERVICE_TYPES.LobbyService)
  private readonly lobbyService: LobbyService;

  @inject(SERVICE_TYPES.MemberService)
  private readonly memberService: MemberService;

  @inject(SERVICE_TYPES.TelegramMessageService)
  private readonly telegramMessageService: TelegramMessageService;

  @inject(SERVICE_TYPES.TelegramUserService)
  private readonly telegramUserService: TelegramUserService;

  private static readonly CANCEL_COMMAND = '/cancel';

  constructor(
    @inject(TELEGRAM_BOT_TYPES.Commands$) commands$: Observable<Message>
  ) {
    super(
      commands$.pipe(
        filter(msg => msg.text === CancelPokerSubscription.CANCEL_COMMAND)
      )
    );
  }

  protected async handle(msg: Message): Promise<void> {
    const member = await this.telegramUserService.getMemberByTelegramUserId(
      msg.from.id
    );
    const lobbyId = await this.memberService.getMembersLobbyId(member.id);

    await this.lobbyService.cancelPoker(lobbyId);

    const messages = await this.telegramMessageService.getMessages(
      lobbyId,
      TelegramMessageType.Poker
    );
    await this.telegramMessageService.deleteMessages(
      lobbyId,
      TelegramMessageType.Poker
    );
    messages.forEach(msg =>
      this.bot.deleteMessage(msg.chat_id, String(msg.message_id))
    );
  }
}
