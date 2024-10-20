import {injectable, inject} from 'inversify';
import {Message} from 'node-telegram-bot-api';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';

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
export default class ResetUserSubscription extends AbstractMessageSubscription {
  @inject(SERVICE_TYPES.TelegramMessageService)
  private readonly telegramMessageService: TelegramMessageService;

  @inject(SERVICE_TYPES.TelegramUserService)
  private readonly telegramUserService: TelegramUserService;

  @inject(SERVICE_TYPES.LobbyService)
  private readonly lobbyService: LobbyService;

  @inject(SERVICE_TYPES.MemberService)
  private readonly memberService: MemberService;

  private static readonly RESET_COMMAND = '/reset';

  constructor(
    @inject(TELEGRAM_BOT_TYPES.Commands$) commands$: Observable<Message>
  ) {
    super(
      commands$.pipe(
        filter(msg => msg.text === ResetUserSubscription.RESET_COMMAND)
      )
    );
  }

  protected async handle(msg: Message): Promise<void> {
    const member = await this.telegramUserService.getMemberByTelegramUserId(
      msg.from!.id
    );

    if (await this.memberService.isMemberInLobby(member.id!)) {
      const lobbyId = await this.memberService.getMembersLobbyId(member.id!);
      await this.lobbyService.leaveMember(member.id!, lobbyId);
      await this.telegramMessageService.deleteAllMessagesFromChat(
        lobbyId,
        msg.chat.id
      );
    }

    await this.telegramUserService.deleteMemberByMemberId(member.id!);

    await this.bot.sendMessage(msg.chat.id, 'Your user was successfully reset');
  }
}
