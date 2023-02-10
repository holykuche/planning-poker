import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Message } from "node-telegram-bot-api";

import { LobbyState, TelegramMessageType } from "data/enum";
import { Member } from "data/entity";
import { LobbyService, SERVICE_TYPES, SubscriptionService, TelegramDataService } from "service/api";
import { EventType } from "service/event";
import { PokerResultItemDto } from "service/dto";

import { ButtonCommand } from "../enum";
import { formatLobby, formatPoker, formatFinishResult, formatDestroyedLobby, fromTelegramUserToMember } from "../utils";
import { TELEGRAM_BOT_TYPES } from "../bot";

import MessageSubscriptionTemplate from "./MessageSubscriptionTemplate";

@injectable()
export default class MemberEnterSubscription extends MessageSubscriptionTemplate {

    @inject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @inject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;
    @inject(SERVICE_TYPES.SubscriptionService) private readonly subscriptionService: SubscriptionService;

    constructor(@inject(TELEGRAM_BOT_TYPES.PlaintTexts$) messages$: Observable<Message>) {
        const memberEnterMessages$ = messages$
            .pipe(
                filter(msg => !this.telegramDataService.isMemberExists(msg.from.id)),
            );
        super(memberEnterMessages$);
    }

    protected async handle(msg: Message): Promise<void> {
        const lobbyName = msg.text.trim().toUpperCase();
        const { id: memberId } = this.telegramDataService.createMember(fromTelegramUserToMember(msg.from));
        this.lobbyService.enterMember(memberId, lobbyName);
        const { id: lobbyId, state: lobbyState, currentTheme: lobbyCurrentTheme } = this.lobbyService.getMembersLobby(memberId);

        await this.initLobbyMessage(msg.chat.id, msg.from.id, lobbyId, lobbyName);

        if (lobbyState === LobbyState.Playing) {
            const pokerResult = this.lobbyService.getPokerResult(lobbyId);
            await this.initPokerMessage(msg.chat.id, msg.from.id, lobbyId, lobbyCurrentTheme, pokerResult);
        }

        this.subscriptionService.subscribe(lobbyId, memberId, async event => {
            switch (event.type) {
                case EventType.MembersWasChanged:
                    await this.updateLobbyMessage(msg.chat.id, msg.from.id, lobbyId, lobbyName, event.payload.members);
                    break;
                case EventType.PokerWasStarted:
                    await this.initPokerMessage(msg.chat.id, msg.from.id, lobbyId, event.payload.theme, event.payload.result);
                    break;
                case EventType.PokerResultWasChanged:
                    await this.updatePokerMessage(msg.chat.id, msg.from.id, lobbyId, memberId, event.payload.result);
                    break;
                case EventType.PokerWasFinished:
                    await this.initFinishMessage(msg.chat.id, msg.from.id, lobbyId, event.payload.theme, event.payload.result);
                    break;
                case EventType.LobbyWasDestroyed:
                    await this.initDestroyedLobbyMessage(msg.chat.id, lobbyId, lobbyName, memberId);
                    break;
                default:
            }
        });
    }

    private async initLobbyMessage(chatId: number,
                                   telegramUserId: number,
                                   lobbyId: number,
                                   lobbyName: string): Promise<void> {
        const members = this.lobbyService.getMembers(lobbyId);

        const lobbyMsg = await this.bot.sendMessage(chatId, formatLobby(lobbyName, members, telegramUserId), {
            parse_mode: MemberEnterSubscription.PARSE_MODE,
            reply_markup: {
                inline_keyboard: MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.Leave ],
            },
        });
        this.telegramDataService.addMessage({
            lobbyId,
            chatId: lobbyMsg.chat.id,
            messageId: lobbyMsg.message_id,
            messageType: TelegramMessageType.Lobby,
        });
    }

    private async updateLobbyMessage(chatId: number,
                                     telegramUserId: number,
                                     lobbyId: number,
                                     lobbyName: string,
                                     members: Member[]): Promise<void> {
        await this.bot.editMessageText(formatLobby(lobbyName, members, telegramUserId), {
            chat_id: chatId,
            message_id: this.telegramDataService.getMessage(lobbyId, chatId, TelegramMessageType.Lobby).messageId,
            parse_mode: MemberEnterSubscription.PARSE_MODE,
            reply_markup: {
                inline_keyboard: MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.Leave ],
            },
        });
    }

    private async initPokerMessage(chatId: number,
                                   telegramUserId: number,
                                   lobbyId: number,
                                   theme: string,
                                   pokerResult: PokerResultItemDto[]): Promise<void> {
        const pokerResultMsg = await this.bot.sendMessage(chatId, formatPoker(theme, pokerResult, telegramUserId), {
            parse_mode: MemberEnterSubscription.PARSE_MODE,
            reply_markup: {
                inline_keyboard: MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.PutCard ],
            },
        });
        this.telegramDataService.addMessage({
            lobbyId,
            chatId: pokerResultMsg.chat.id,
            messageId: pokerResultMsg.message_id,
            messageType: TelegramMessageType.Poker,
        });
    }

    private async updatePokerMessage(chatId: number,
                                     telegramUserId: number,
                                     lobbyId: number,
                                     memberId: number,
                                     result: PokerResultItemDto[]): Promise<void> {
        const card = result
            .find(resultItem => resultItem.member.id === memberId)
            .card;
        const { currentTheme } = this.lobbyService.getById(lobbyId);

        await this.bot.editMessageText(formatPoker(currentTheme, result, telegramUserId), {
            chat_id: chatId,
            message_id: this.telegramDataService.getMessage(lobbyId, chatId, TelegramMessageType.Poker).messageId,
            parse_mode: MemberEnterSubscription.PARSE_MODE,
            reply_markup: {
                inline_keyboard: card
                    ? MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.RemoveCard ]
                    : MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.PutCard ],
            },
        });
    }

    private async initFinishMessage(chatId: number,
                                    telegramUserId: number,
                                    lobbyId: number,
                                    pokerTheme: string,
                                    result: PokerResultItemDto[]): Promise<void> {
        const pokerMessage = this.telegramDataService.getMessage(lobbyId, chatId, TelegramMessageType.Poker);
        await this.bot.deleteMessage(chatId, String(pokerMessage.messageId));
        this.telegramDataService.deleteMessageById(pokerMessage.id);

        await this.bot.sendMessage(chatId, formatFinishResult(pokerTheme, result, telegramUserId), {
            parse_mode: MemberEnterSubscription.PARSE_MODE,
        });
    }

    private async initDestroyedLobbyMessage(chatId: number,
                                            lobbyId: number,
                                            lobbyName: string,
                                            memberId): Promise<void> {
        const lobbyMessage = this.telegramDataService.getMessage(lobbyId, chatId, TelegramMessageType.Lobby);
        await this.bot.editMessageReplyMarkup(null, {
            chat_id: chatId,
            message_id: lobbyMessage.messageId,
        });

        const resultMessage = this.telegramDataService.getMessage(lobbyId, chatId, TelegramMessageType.Poker);
        if (resultMessage) {
            await this.bot.deleteMessage(chatId, String(resultMessage.messageId));
        }

        this.telegramDataService.deleteAllMessagesFromChat(lobbyId, chatId);
        this.telegramDataService.deleteMemberByMemberId(memberId);

        await this.bot.sendMessage(chatId, formatDestroyedLobby(lobbyName), {
            parse_mode: MemberEnterSubscription.PARSE_MODE,
            disable_notification: true,
        });
    }
}
