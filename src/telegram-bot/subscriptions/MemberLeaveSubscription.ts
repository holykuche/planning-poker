import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { TelegramMessageType } from "data/enum";
import { LobbyService, MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import { ButtonCommand } from "../enum";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class MemberLeaveSubscription extends TelegramBotSubscription<CallbackQuery> {

    @lazyInject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(callbacks$: Observable<CallbackQuery>, bot: TelegramBot) {
        const leaveTelegramUserIds$ = callbacks$
            .pipe(
                filter(callback => callback.data === ButtonCommand.Leave)
            );
        super(leaveTelegramUserIds$, bot);
    }

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async callback => {
                try {
                    const member = this.telegramDataService.getMemberByTelegramUserId(callback.from.id);
                    const lobbyId = this.memberService.getMembersLobbyId(member.id);

                    const lobbyMessageId = this.telegramDataService.getMessageId(lobbyId, callback.message.chat.id, TelegramMessageType.Lobby);
                    await this.bot.editMessageReplyMarkup(null, {
                        chat_id: callback.message.chat.id,
                        message_id: lobbyMessageId,
                    });

                    const resultMessageId = this.telegramDataService.getMessageId(lobbyId, callback.message.chat.id, TelegramMessageType.Poker);
                    if (resultMessageId) {
                        await this.bot.editMessageReplyMarkup(null, {
                            chat_id: callback.message.chat.id,
                            message_id: resultMessageId,
                        });
                    }

                    this.telegramDataService.deleteAllMessageKeysFromChat(lobbyId, callback.message.chat.id);
                    this.lobbyService.leaveMember(member.id);
                    this.telegramDataService.deleteMemberByMemberId(member.id);

                    await this.bot.sendMessage(callback.message.chat.id, "You've gone");
                } catch (error) {
                    console.log(error);
                }
            });
    }
}
