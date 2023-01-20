import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { LobbyService, MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import TelegramBotSubscription from "./TelegramBotSubscription";

export default class MemberLeaveSubscription extends TelegramBotSubscription {

    private static readonly LEAVE_MSG_TEXT = "/leave";

    @lazyInject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(messages$: Observable<Message>, bot: TelegramBot) {
        const leaveTelegramUserIds$ = messages$
            .pipe(
                filter(msg => msg.text === MemberLeaveSubscription.LEAVE_MSG_TEXT)
            );
        super(leaveTelegramUserIds$, bot);
    }

    subscribe(): Subscription {
        return this.messages$
            .subscribe(async msg => {
                try {
                    const member = this.telegramDataService.getMemberByTelegramUserId(msg.from.id);
                    this.lobbyService.leaveMember(member.id);
                    this.telegramDataService.deleteMemberByMemberId(member.id);

                    await this.bot.sendMessage(msg.chat.id, "You've gone");
                } catch (error) {
                    console.log(error);
                }
            });
    }
}
