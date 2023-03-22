import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Message } from "node-telegram-bot-api";

import { TelegramMessageType } from "data/telegram-data/enum";
import { TELEGRAM_SERVICE_TYPES, TelegramMessageService, TelegramUserService } from "service/telegram-service/api";

import { LobbyService, SubscriptionService, COMMON_SERVICE_TYPES } from "service/common-service/api";
import { EventType, LobbyEvent, MembersWasChangedLobbyEvent, PokerResultWasChangedLobbyEvent, PokerWasFinishedLobbyEvent } from "service/common-service/event";

import { ButtonCommand } from "../enum";
import { formatLobby, formatPoker, formatFinishResult, formatDestroyedLobby, fromTelegramUserToMember } from "../utils";
import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractMessageSubscription from "./AbstractMessageSubscription";

interface LobbyEventContext {
    chatId: number;
    telegramUserId: number;
    lobbyId: number;
    lobbyName: string;
    memberId: number;
}

type LobbyEventHandler = (eventContext: LobbyEventContext, payload: LobbyEvent["payload"]) => Promise<void>;

@injectable()
export default class MemberEnterSubscription extends AbstractMessageSubscription {

    @inject(TELEGRAM_SERVICE_TYPES.TelegramMessageService) private readonly telegramMessageService: TelegramMessageService;
    @inject(TELEGRAM_SERVICE_TYPES.TelegramUserService) private readonly telegramUserService: TelegramUserService;
    @inject(COMMON_SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @inject(COMMON_SERVICE_TYPES.SubscriptionService) private readonly subscriptionService: SubscriptionService;

    constructor(@inject(TELEGRAM_BOT_TYPES.PlaintTexts$) messages$: Observable<Message>) {
        super(
            messages$
                .pipe(
                    filter(msg => !this.telegramUserService.isMemberExists(msg.from.id)),
                )
        );

        this.membersWasChangedHandler = this.membersWasChangedHandler.bind(this);
        this.pokerResultWasChangedHandler = this.pokerResultWasChangedHandler.bind(this);
        this.pokerWasFinishedHandler = this.pokerWasFinishedHandler.bind(this);
        this.lobbyWasDestroyedHandler = this.lobbyWasDestroyedHandler.bind(this);
    }

    protected async handle(msg: Message): Promise<void> {
        const { chat: { id: chatId }, from: { id: telegramUserId } } = msg;
        const lobbyName = msg.text.trim().toUpperCase();

        const { id: lobbyId } = this.lobbyService.getByName(lobbyName) || this.lobbyService.createLobby(lobbyName);
        const { id: memberId } = this.telegramUserService.createMember(fromTelegramUserToMember(msg.from));

        const eventContext = { chatId, telegramUserId, lobbyId, lobbyName, memberId };

        this.subscriptionService.subscribe(lobbyId, memberId, async event => {
            try {
                await this.resolveLobbyEventHandler(event.type)(eventContext, event.payload);
            } catch (error: unknown) {
                await this.handleError(error);
            }
        });

        this.lobbyService.enterMember(memberId, lobbyId);
    }

    private resolveLobbyEventHandler(eventType: EventType): LobbyEventHandler {
        switch (eventType) {
            case EventType.MembersWasChanged:
                return this.membersWasChangedHandler;
            case EventType.PokerResultWasChanged:
                return this.pokerResultWasChangedHandler;
            case EventType.PokerWasFinished:
                return this.pokerWasFinishedHandler;
            case EventType.LobbyWasDestroyed:
                return this.lobbyWasDestroyedHandler;
            default:
                throw new Error("Unhandled lobby event: " + eventType);
        }
    }

    private async membersWasChangedHandler(eventContext: LobbyEventContext, payload: MembersWasChangedLobbyEvent["payload"]): Promise<void> {
        const { chatId, telegramUserId, lobbyId, lobbyName } = eventContext;
        const { members } = payload;

        const message = this.telegramMessageService.getMessage(lobbyId, chatId, TelegramMessageType.Lobby);

        if (message) {
            await this.bot.editMessageText(formatLobby(lobbyName, members, telegramUserId), {
                chat_id: chatId,
                message_id: message.messageId,
                parse_mode: MemberEnterSubscription.PARSE_MODE,
                reply_markup: {
                    inline_keyboard: MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.Leave ],
                },
            });
        } else {
            const lobbyMsg = await this.bot.sendMessage(chatId, formatLobby(lobbyName, members, telegramUserId), {
                parse_mode: MemberEnterSubscription.PARSE_MODE,
                reply_markup: {
                    inline_keyboard: MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.Leave ],
                },
            });
            this.telegramMessageService.addMessage({
                lobbyId,
                chatId: lobbyMsg.chat.id,
                messageId: lobbyMsg.message_id,
                messageType: TelegramMessageType.Lobby,
            });
        }
    }

    private async pokerResultWasChangedHandler(eventContext: LobbyEventContext, payload: PokerResultWasChangedLobbyEvent["payload"]): Promise<void> {
        const { chatId, telegramUserId, lobbyId } = eventContext;
        const { theme, result } = payload;

        const message = this.telegramMessageService.getMessage(lobbyId, chatId, TelegramMessageType.Poker);
        const messageText = formatPoker(theme, result, telegramUserId);

        if (message) {
            const card = result
                .find(resultItem => resultItem.member.telegramUserId === telegramUserId)
                .card;

            await this.bot.editMessageText(messageText, {
                chat_id: chatId,
                message_id: message.messageId,
                parse_mode: MemberEnterSubscription.PARSE_MODE,
                reply_markup: {
                    inline_keyboard: card
                        ? MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.RemoveCard ]
                        : MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.PutCard ],
                },
            });
        } else {
            const pokerResultMsg = await this.bot.sendMessage(chatId, messageText, {
                parse_mode: MemberEnterSubscription.PARSE_MODE,
                reply_markup: {
                    inline_keyboard: MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.PutCard ],
                },
            });
            this.telegramMessageService.addMessage({
                lobbyId,
                chatId: pokerResultMsg.chat.id,
                messageId: pokerResultMsg.message_id,
                messageType: TelegramMessageType.Poker,
            });
        }
    }

    private async pokerWasFinishedHandler(eventContext: LobbyEventContext, payload: PokerWasFinishedLobbyEvent["payload"]): Promise<void> {
        const { chatId, telegramUserId, lobbyId } = eventContext;
        const { theme, result } = payload;

        const pokerMessage = this.telegramMessageService.getMessage(lobbyId, chatId, TelegramMessageType.Poker);
        await this.bot.deleteMessage(chatId, String(pokerMessage.messageId));
        this.telegramMessageService.deleteMessageById(pokerMessage.id);

        await this.bot.sendMessage(chatId, formatFinishResult(theme, result, telegramUserId), {
            parse_mode: MemberEnterSubscription.PARSE_MODE,
        });
    }

    private async lobbyWasDestroyedHandler(eventContext: LobbyEventContext): Promise<void> {
        const { chatId, lobbyId, lobbyName, memberId } = eventContext;

        const lobbyMessage = this.telegramMessageService.getMessage(lobbyId, chatId, TelegramMessageType.Lobby);
        await this.bot.editMessageReplyMarkup(null, {
            chat_id: chatId,
            message_id: lobbyMessage.messageId,
        });

        const resultMessage = this.telegramMessageService.getMessage(lobbyId, chatId, TelegramMessageType.Poker);
        if (resultMessage) {
            await this.bot.deleteMessage(chatId, String(resultMessage.messageId));
        }

        this.telegramMessageService.deleteAllMessagesFromChat(lobbyId, chatId);
        this.telegramUserService.deleteMemberByMemberId(memberId);

        await this.bot.sendMessage(chatId, formatDestroyedLobby(lobbyName), {
            parse_mode: MemberEnterSubscription.PARSE_MODE,
            disable_notification: true,
        });
    }
}
