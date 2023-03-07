import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { CallbackQuery } from "node-telegram-bot-api";

import { TelegramMessageType } from "data/telegram-data/enum";
import { TELEGRAM_SERVICE_TYPES, TelegramMessageService, TelegramUserService } from "service/telegram-service/api";
import { COMMON_SERVICE_TYPES, LobbyService, MemberService } from "service/common-service/api";

import { ButtonCommand } from "../enum";
import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractCallbackQuerySubscription from "./AbstractCallbackQuerySubscription";

@injectable()
export default class MemberLeaveSubscription extends AbstractCallbackQuerySubscription {

    @inject(TELEGRAM_SERVICE_TYPES.TelegramMessageService) private readonly telegramMessageService: TelegramMessageService;
    @inject(TELEGRAM_SERVICE_TYPES.TelegramUserService) private readonly telegramUserService: TelegramUserService;
    @inject(COMMON_SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @inject(COMMON_SERVICE_TYPES.MemberService) private readonly memberService: MemberService;

    constructor(@inject(TELEGRAM_BOT_TYPES.CallbackQueries$) callbackQueries$: Observable<CallbackQuery>) {
        super(
            callbackQueries$
                .pipe(
                    filter(callback => callback.data === ButtonCommand.Leave),
                )
        );
    }

    protected async handle(callbackQuery: CallbackQuery): Promise<void> {
        const member = this.telegramUserService.getMemberByTelegramUserId(callbackQuery.from.id);
        const lobbyId = this.memberService.getMembersLobbyId(member.id);

        const lobbyMessage = this.telegramMessageService.getMessage(lobbyId, callbackQuery.message.chat.id, TelegramMessageType.Lobby);
        await this.bot.editMessageReplyMarkup(null, {
            chat_id: callbackQuery.message.chat.id,
            message_id: lobbyMessage.messageId,
        });

        const resultMessage = this.telegramMessageService.getMessage(lobbyId, callbackQuery.message.chat.id, TelegramMessageType.Poker);
        if (resultMessage) {
            await this.bot.deleteMessage(callbackQuery.message.chat.id, String(resultMessage.messageId));
        }

        this.telegramMessageService.deleteAllMessagesFromChat(lobbyId, callbackQuery.message.chat.id);
        this.lobbyService.leaveMember(member.id, lobbyId);
        this.telegramUserService.deleteMemberByMemberId(member.id);

        await this.bot.sendMessage(callbackQuery.message.chat.id, "You've gone");
    }
}
