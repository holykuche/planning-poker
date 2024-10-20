import {injectable, inject} from 'inversify';
import {CallbackQuery, InlineKeyboardMarkup} from 'node-telegram-bot-api';
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
import {ButtonCommand} from '../enum';

import AbstractCallbackQuerySubscription from './AbstractCallbackQuerySubscription';

@injectable()
export default class MemberLeaveSubscription extends AbstractCallbackQuerySubscription {
  @inject(SERVICE_TYPES.TelegramMessageService)
  private readonly telegramMessageService: TelegramMessageService;

  @inject(SERVICE_TYPES.TelegramUserService)
  private readonly telegramUserService: TelegramUserService;

  @inject(SERVICE_TYPES.LobbyService)
  private readonly lobbyService: LobbyService;

  @inject(SERVICE_TYPES.MemberService)
  private readonly memberService: MemberService;

  constructor(
    @inject(TELEGRAM_BOT_TYPES.CallbackQueries$)
    callbackQueries$: Observable<CallbackQuery>
  ) {
    super(
      callbackQueries$.pipe(
        filter(callback => callback.data === ButtonCommand.Leave)
      )
    );
  }

  protected async handle(callbackQuery: CallbackQuery): Promise<void> {
    const member = await this.telegramUserService.getMemberByTelegramUserId(
      callbackQuery.from.id
    );
    const lobbyId = await this.memberService.getMembersLobbyId(member.id!);

    const lobbyMessage = await this.telegramMessageService.getMessage(
      lobbyId,
      callbackQuery.message!.chat.id,
      TelegramMessageType.Lobby
    );
    await this.bot.editMessageReplyMarkup(
      null as unknown as InlineKeyboardMarkup,
      {
        chat_id: callbackQuery.message!.chat.id,
        message_id: lobbyMessage!.message_id,
      }
    );

    const resultMessage = await this.telegramMessageService.getMessage(
      lobbyId,
      callbackQuery.message!.chat.id,
      TelegramMessageType.Poker
    );
    if (resultMessage) {
      await this.bot.deleteMessage(
        callbackQuery.message!.chat.id,
        String(resultMessage.message_id)
      );
    }

    await this.telegramMessageService.deleteAllMessagesFromChat(
      lobbyId,
      callbackQuery.message!.chat.id
    );
    await this.lobbyService.leaveMember(member.id!, lobbyId);
    await this.telegramUserService.deleteMemberByMemberId(member.id!);

    await this.bot.sendMessage(callbackQuery.message!.chat.id, "You've gone");
  }
}
