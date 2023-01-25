import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { LobbyService, MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import AbstractTelegramBotMessageSubscription from "./AbstractTelegramBotMessageSubscription";

export default class ResetUserSubscription extends AbstractTelegramBotMessageSubscription {

    @lazyInject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    private static readonly RESET_COMMAND = "/reset";

    constructor(messages$: Observable<Message>, bot: TelegramBot) {
        const helpMessages$ = messages$
            .pipe(
                filter(msg => msg.text === ResetUserSubscription.RESET_COMMAND)
            );
        super(helpMessages$, bot);
    }

    protected async handle(msg: TelegramBot.Message): Promise<void> {
        const member = this.telegramDataService.getMemberByTelegramUserId(msg.from.id);

        if (this.memberService.isMemberInLobby(member.id)) {
            const lobbyId = this.memberService.getMembersLobbyId(member.id);
            this.lobbyService.leaveMember(member.id);
            this.telegramDataService.deleteAllMessageKeysFromChat(lobbyId, msg.chat.id);
        }

        this.telegramDataService.deleteMemberByMemberId(member.id);

        await this.bot.sendMessage(msg.chat.id, "Your user was successfully reset");
    }
}
