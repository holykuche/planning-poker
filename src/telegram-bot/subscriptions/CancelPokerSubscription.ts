import { inject, injectable } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Message } from "node-telegram-bot-api";

import { TelegramMessageType } from "data/telegram-data/enum";
import { TELEGRAM_SERVICE_TYPES, TelegramMessageService, TelegramUserService } from "service/telegram-service/api";
import { COMMON_SERVICE_TYPES, LobbyService, MemberService } from "service/common-service/api";

import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractMessageSubscription from "./AbstractMessageSubscription";

@injectable()
export default class CancelPokerSubscription extends AbstractMessageSubscription {

    @inject(COMMON_SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @inject(COMMON_SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @inject(TELEGRAM_SERVICE_TYPES.TelegramMessageService) private readonly telegramMessageService: TelegramMessageService;
    @inject(TELEGRAM_SERVICE_TYPES.TelegramUserService) private readonly telegramUserService: TelegramUserService;

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
        const member = this.telegramUserService.getMemberByTelegramUserId(msg.from.id);
        const lobbyId = this.memberService.getMembersLobbyId(member.id);

        this.lobbyService.cancelPoker(lobbyId);

        const messages = this.telegramMessageService.getMessages(lobbyId, TelegramMessageType.Poker);
        this.telegramMessageService.deleteMessages(lobbyId, TelegramMessageType.Poker);
        messages.forEach(msg => this.bot.deleteMessage(msg.chatId, String(msg.messageId)));
    }

}