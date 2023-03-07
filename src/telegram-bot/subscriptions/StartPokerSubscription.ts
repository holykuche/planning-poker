import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Message } from "node-telegram-bot-api";

import { TELEGRAM_SERVICE_TYPES, TelegramUserService } from "service/telegram-service/api";
import { COMMON_SERVICE_TYPES, LobbyService, MemberService } from "service/common-service/api";

import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractMessageSubscription from "./AbstractMessageSubscription";

@injectable()
export default class StartPokerSubscription extends AbstractMessageSubscription {

    @inject(TELEGRAM_SERVICE_TYPES.TelegramUserService) private readonly telegramUserService: TelegramUserService;
    @inject(COMMON_SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @inject(COMMON_SERVICE_TYPES.MemberService) private readonly memberService: MemberService;

    constructor(@inject(TELEGRAM_BOT_TYPES.PlaintTexts$) messages$: Observable<Message>) {
        super(
            messages$
                .pipe(
                    filter(msg => this.telegramUserService.isMemberExists(msg.from.id)),
                )
        );
    }

    protected async handle(msg: Message): Promise<void> {
        const theme = msg.text.trim();
        const member = this.telegramUserService.getMemberByTelegramUserId(msg.from.id);
        const lobbyId = this.memberService.getMembersLobbyId(member.id);

        this.lobbyService.startPoker(lobbyId, theme);
    }
}
