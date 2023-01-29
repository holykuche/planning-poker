import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Message } from "node-telegram-bot-api";

import { LobbyService, MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractTelegramBotMessageSubscription from "./AbstractTelegramBotMessageSubscription";

@injectable()
export default class ResetUserSubscription extends AbstractTelegramBotMessageSubscription {

    @inject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @inject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @inject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    private static readonly RESET_COMMAND = "/reset";

    constructor(@inject(TELEGRAM_BOT_TYPES.Commands$) commands$: Observable<Message>) {
        const helpMessages$ = commands$
            .pipe(
                filter(msg => msg.text === ResetUserSubscription.RESET_COMMAND)
            );
        super(helpMessages$);
    }

    protected async handle(msg: Message): Promise<void> {
        const member = this.telegramDataService.getMemberByTelegramUserId(msg.from.id);

        if (this.memberService.isMemberInLobby(member.id)) {
            const lobbyId = this.memberService.getMembersLobbyId(member.id);
            this.lobbyService.leaveMember(member.id);
            this.telegramDataService.deleteAllMessagesFromChat(lobbyId, msg.chat.id);
        }

        this.telegramDataService.deleteMemberByMemberId(member.id);

        await this.bot.sendMessage(msg.chat.id, "Your user was successfully reset");
    }
}
