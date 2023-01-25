import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { LobbyService, MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import TelegramBotSubscription from "./TelegramBotSubscription";

export default class ResetUserSubscription extends TelegramBotSubscription<Message> {

    @lazyInject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    private static readonly RESET_COMMAND = "/reset";

    constructor(messages$: Observable<Message>, bot?: TelegramBot) {
        const helpMessages$ = messages$
            .pipe(
                filter(msg => msg.text === ResetUserSubscription.RESET_COMMAND)
            );
        super(helpMessages$, bot);
    }

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async msg => {
                try {
                    if (!this.telegramDataService.isMemberExisted(msg.from.id)) {
                        return;
                    }

                    const member = this.telegramDataService.getMemberByTelegramUserId(msg.from.id);

                    if (this.memberService.isMemberInLobby(member.id)) {
                        const lobbyId = this.memberService.getMembersLobbyId(member.id);
                        this.lobbyService.leaveMember(member.id);
                        this.telegramDataService.deleteAllMessageKeysFromChat(lobbyId, msg.chat.id);
                    }

                    this.telegramDataService.deleteMemberByMemberId(member.id);
                } catch (error) {
                    await this.handleError(msg.chat.id, error);
                }
            });
    }

}