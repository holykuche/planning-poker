import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { CallbackQuery } from "node-telegram-bot-api";

import { TelegramMessageType } from "data/enum";
import { LobbyService, MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import { ButtonCommand } from "../enum";
import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractTelegramBotCallbackQuerySubscription from "./AbstractTelegramBotCallbackQuerySubscription";

@injectable()
export default class MemberLeaveSubscription extends AbstractTelegramBotCallbackQuerySubscription {

    @inject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @inject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @inject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(@inject(TELEGRAM_BOT_TYPES.CallbackQueries$) callbackQueries$: Observable<CallbackQuery>) {
        const leaveCallbackQueries$ = callbackQueries$
            .pipe(
                filter(callback => callback.data === ButtonCommand.Leave)
            );
        super(leaveCallbackQueries$);
    }

    protected async handle(callbackQuery: CallbackQuery): Promise<void> {
        const member = this.telegramDataService.getMemberByTelegramUserId(callbackQuery.from.id);
        const lobbyId = this.memberService.getMembersLobbyId(member.id);

        const lobbyMessage = this.telegramDataService.getMessage(lobbyId, callbackQuery.message.chat.id, TelegramMessageType.Lobby);
        await this.bot.editMessageReplyMarkup(null, {
            chat_id: callbackQuery.message.chat.id,
            message_id: lobbyMessage.messageId,
        });

        const resultMessageId = this.telegramDataService.getMessage(lobbyId, callbackQuery.message.chat.id, TelegramMessageType.Poker);
        if (resultMessageId) {
            await this.bot.deleteMessage(callbackQuery.message.chat.id, String(resultMessageId));
        }

        this.telegramDataService.deleteAllMessagesFromChat(lobbyId, callbackQuery.message.chat.id);
        this.lobbyService.leaveMember(member.id);
        this.telegramDataService.deleteMemberByMemberId(member.id);

        await this.bot.sendMessage(callbackQuery.message.chat.id, "You've gone");
    }
}
