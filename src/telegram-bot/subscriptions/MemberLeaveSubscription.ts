import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { TelegramMessageType } from "data/enum";
import { LobbyService, MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import { ButtonCommand } from "../enum";
import AbstractTelegramBotCallbackQuerySubscription from "./AbstractTelegramBotCallbackQuerySubscription";

export default class MemberLeaveSubscription extends AbstractTelegramBotCallbackQuerySubscription {

    @lazyInject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(callbackQueries$: Observable<CallbackQuery>, bot: TelegramBot) {
        const leaveTelegramUserIds$ = callbackQueries$
            .pipe(
                filter(callback => callback.data === ButtonCommand.Leave)
            );
        super(leaveTelegramUserIds$, bot);
    }

    protected async handle(callbackQuery: CallbackQuery): Promise<void> {
        const member = this.telegramDataService.getMemberByTelegramUserId(callbackQuery.from.id);
        const lobbyId = this.memberService.getMembersLobbyId(member.id);

        const lobbyMessageId = this.telegramDataService.getMessageId(lobbyId, callbackQuery.message.chat.id, TelegramMessageType.Lobby);
        await this.bot.editMessageReplyMarkup(null, {
            chat_id: callbackQuery.message.chat.id,
            message_id: lobbyMessageId,
        });

        const resultMessageId = this.telegramDataService.getMessageId(lobbyId, callbackQuery.message.chat.id, TelegramMessageType.Poker);
        if (resultMessageId) {
            await this.bot.deleteMessage(callbackQuery.message.chat.id, String(resultMessageId));
        }

        this.telegramDataService.deleteAllMessageKeysFromChat(lobbyId, callbackQuery.message.chat.id);
        this.lobbyService.leaveMember(member.id);
        this.telegramDataService.deleteMemberByMemberId(member.id);

        await this.bot.sendMessage(callbackQuery.message.chat.id, "You've gone");
    }
}
