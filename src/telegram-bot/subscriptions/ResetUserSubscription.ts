import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Message } from "node-telegram-bot-api";

import { TelegramDataService, TELEGRAM_SERVICE_TYPES } from "service/telegram-service/api";
import { LobbyService, MemberService, COMMON_SERVICE_TYPES } from "service/common-service/api";

import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractMessageSubscription from "./AbstractMessageSubscription";

@injectable()
export default class ResetUserSubscription extends AbstractMessageSubscription {

    @inject(TELEGRAM_SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;
    @inject(COMMON_SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @inject(COMMON_SERVICE_TYPES.MemberService) private readonly memberService: MemberService;

    private static readonly RESET_COMMAND = "/reset";

    constructor(@inject(TELEGRAM_BOT_TYPES.Commands$) commands$: Observable<Message>) {
        super(
            commands$
                .pipe(
                    filter(msg => msg.text === ResetUserSubscription.RESET_COMMAND),
                )
        );
    }

    protected async handle(msg: Message): Promise<void> {
        const member = this.telegramDataService.getMemberByTelegramUserId(msg.from.id);

        if (this.memberService.isMemberInLobby(member.id)) {
            const lobbyId = this.memberService.getMembersLobbyId(member.id);
            this.lobbyService.leaveMember(member.id, lobbyId);
            this.telegramDataService.deleteAllMessagesFromChat(lobbyId, msg.chat.id);
        }

        this.telegramDataService.deleteMemberByMemberId(member.id);

        await this.bot.sendMessage(msg.chat.id, "Your user was successfully reset");
    }
}
