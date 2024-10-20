import {injectable, inject} from 'inversify';
import {Message} from 'node-telegram-bot-api';
import {Observable} from 'rxjs';

import {
  LobbyService,
  MemberService,
  SERVICE_TYPES,
  TelegramUserService,
} from '@/service/api';

import {TELEGRAM_BOT_TYPES} from '../bot';

import AbstractMessageSubscription from './AbstractMessageSubscription';

@injectable()
export default class StartPokerSubscription extends AbstractMessageSubscription {
  @inject(SERVICE_TYPES.TelegramUserService)
  private readonly telegramUserService: TelegramUserService;

  @inject(SERVICE_TYPES.LobbyService)
  private readonly lobbyService: LobbyService;

  @inject(SERVICE_TYPES.MemberService)
  private readonly memberService: MemberService;

  constructor(
    @inject(TELEGRAM_BOT_TYPES.PlaintTexts$) messages$: Observable<Message>
  ) {
    super(messages$);
  }

  protected async handle(msg: Message): Promise<void> {
    if (!(await this.telegramUserService.isMemberExists(msg.from!.id))) {
      return;
    }

    const theme = msg.text!.trim();
    const member = await this.telegramUserService.getMemberByTelegramUserId(
      msg.from!.id
    );
    const lobbyId = await this.memberService.getMembersLobbyId(member.id!);

    await this.lobbyService.startPoker(lobbyId, theme);
  }
}
