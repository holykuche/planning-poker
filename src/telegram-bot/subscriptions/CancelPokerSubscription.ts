import { inject, injectable } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Message } from "node-telegram-bot-api";

import { TelegramMessageType } from "data/enum";
import { LobbyService, MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractMessageSubscription from "./AbstractMessageSubscription";

@injectable()
export default class CancelPokerSubscription extends AbstractMessageSubscription {

    @inject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @inject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @inject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    private static readonly CANCEL_COMMAND = "/cancel";

    constructor(@inject(TELEGRAM_BOT_TYPES.Commands$) commands$: Observable<Message>) {
        super(
            commands$
                .pipe(
                    filter(msg => msg.text === CancelPokerSubscription.CANCEL_COMMAND),
                ),
        );
    }

    protected async handle(msg: Message): Promise<void> {
        const member = this.telegramDataService.getMemberByTelegramUserId(msg.from.id);
        const lobbyId = this.memberService.getMembersLobbyId(member.id);

        this.lobbyService.cancelPoker(lobbyId);

        const messages = this.telegramDataService.getMessages(lobbyId, TelegramMessageType.Poker);
        this.telegramDataService.deleteMessages(lobbyId, TelegramMessageType.Poker);
        messages.forEach(msg => this.bot.deleteMessage(msg.chatId, String(msg.messageId)));
    }

}