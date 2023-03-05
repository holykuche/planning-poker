import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Message } from "node-telegram-bot-api";

import { LobbyService, MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractMessageSubscription from "./AbstractMessageSubscription";

@injectable()
export default class StartPokerSubscription extends AbstractMessageSubscription {

    @inject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @inject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @inject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(@inject(TELEGRAM_BOT_TYPES.PlaintTexts$) messages$: Observable<Message>) {
        super(
            messages$
                .pipe(
                    filter(msg => this.telegramDataService.isMemberExists(msg.from.id)),
                )
        );
    }

    protected async handle(msg: Message): Promise<void> {
        const theme = msg.text.trim();
        const member = this.telegramDataService.getMemberByTelegramUserId(msg.from.id);
        const lobbyId = this.memberService.getMembersLobbyId(member.id);

        this.lobbyService.startPoker(lobbyId, theme);
    }
}
