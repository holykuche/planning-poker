import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { CallbackQuery } from "node-telegram-bot-api";

import { TelegramMessageType } from "data/telegram-data/enum";
import { TelegramDataService, TELEGRAM_SERVICE_TYPES } from "service/telegram-service/api";
import { LobbyService, MemberService, COMMON_SERVICE_TYPES } from "service/common-service/api";

import { ButtonCommand } from "../enum";
import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractCallbackQuerySubscription from "./AbstractCallbackQuerySubscription";

@injectable()
export default class MemberLeaveSubscription extends AbstractCallbackQuerySubscription {

    @inject(TELEGRAM_SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;
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
        const member = this.telegramDataService.getMemberByTelegramUserId(callbackQuery.from.id);
        const lobbyId = this.memberService.getMembersLobbyId(member.id);

        const lobbyMessage = this.telegramDataService.getMessage(lobbyId, callbackQuery.message.chat.id, TelegramMessageType.Lobby);
        await this.bot.editMessageReplyMarkup(null, {
            chat_id: callbackQuery.message.chat.id,
            message_id: lobbyMessage.messageId,
        });

        const resultMessage = this.telegramDataService.getMessage(lobbyId, callbackQuery.message.chat.id, TelegramMessageType.Poker);
        if (resultMessage) {
            await this.bot.deleteMessage(callbackQuery.message.chat.id, String(resultMessage.messageId));
        }

        this.telegramDataService.deleteAllMessagesFromChat(lobbyId, callbackQuery.message.chat.id);
        this.lobbyService.leaveMember(member.id, lobbyId);
        this.telegramDataService.deleteMemberByMemberId(member.id);

        await this.bot.sendMessage(callbackQuery.message.chat.id, "You've gone");
    }
}
