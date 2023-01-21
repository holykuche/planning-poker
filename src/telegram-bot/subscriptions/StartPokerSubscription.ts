import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { LobbyService, MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import TelegramBotSubscription from "./TelegramBotSubscription";

export default class StartPokerSubscription extends TelegramBotSubscription<Message> {

    private static readonly START_POKER_REGEXP = /^(?!\/)(.+)$/;

    @lazyInject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(messages$: Observable<Message>, bot: TelegramBot) {
        const startPokerMessages$ = messages$
            .pipe(
                filter(msg => StartPokerSubscription.START_POKER_REGEXP.test(msg.text))
            );
        super(startPokerMessages$, bot);
    }

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async msg => {
                const theme = msg.text.match(StartPokerSubscription.START_POKER_REGEXP)[ 1 ];

                try {
                    const member = this.telegramDataService.getMemberByTelegramUserId(msg.from.id);
                    const lobbyId = this.memberService.getMembersLobbyId(member.id);

                    this.lobbyService.startPoker(lobbyId, theme);
                } catch (error) {
                    console.log(error);
                }
            });
    }

}
