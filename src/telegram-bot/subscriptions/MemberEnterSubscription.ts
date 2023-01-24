import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { LobbyState, TelegramMessageType } from "data/enum";
import { Member } from "data/entity";
import { LobbyService, SERVICE_TYPES, SubscriptionService, TelegramDataService } from "service/api";
import { EventType } from "service/event";
import { PokerResultItemDto, CardDto } from "service/dto";

import { ButtonCommand } from "../enum";
import { formatLobby, formatPoker, formatResult, formatDestroyedLobby, fromTelegramUserToMember } from "../utils";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class MemberEnterSubscription extends TelegramBotSubscription<Message> {

    @lazyInject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;
    @lazyInject(SERVICE_TYPES.SubscriptionService) private readonly subscriptionService: SubscriptionService;

    constructor(messages$: Observable<Message>, bot: TelegramBot) {
        const memberEnterMessages$ = messages$
            .pipe(
                filter(msg => MemberEnterSubscription.PLAIN_TEXT_REGEXP.test(msg.text)),
                filter(msg => !this.telegramDataService.isMemberExisted(msg.from.id))
            );
        super(memberEnterMessages$, bot);
    }

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async msg => {
                const lobbyName = msg.text.trim().toUpperCase();

                try {
                    const { id: memberId } = this.telegramDataService.createMember(fromTelegramUserToMember(msg.from));
                    const { id: lobbyId, state: lobbyState, currentTheme: lobbyCurrentTheme } = this.lobbyService.enterMember(memberId, lobbyName);

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
                                await this.initFinishMessage(msg.chat.id, msg.from.id, lobbyId, event.payload.theme, event.payload.result, event.payload.totalScore);
                                break;
                            case EventType.LobbyWasDestroyed:
                                await this.initDestroyedLobbyMessage(msg.chat.id, lobbyId, lobbyName, memberId);
                                break;
                            default:
                        }
                    });
                } catch (error) {
                    await this.handleError(msg.chat.id, error);
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
        this.telegramDataService.addMessageKey(lobbyId, TelegramMessageType.Lobby, {
            chatId: lobbyMsg.chat.id,
            messageId: lobbyMsg.message_id,
        });
    }

    private async updateLobbyMessage(chatId: number,
                                     telegramUserId: number,
                                     lobbyId: number,
                                     lobbyName: string,
                                     members: Member[]): Promise<void> {
        await this.bot.editMessageText(formatLobby(lobbyName, members, telegramUserId), {
            chat_id: chatId,
            message_id: this.telegramDataService.getMessageId(lobbyId, chatId, TelegramMessageType.Lobby),
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
        this.telegramDataService.addMessageKey(lobbyId, TelegramMessageType.Poker, {
            chatId: pokerResultMsg.chat.id,
            messageId: pokerResultMsg.message_id,
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
            message_id: this.telegramDataService.getMessageId(lobbyId, chatId, TelegramMessageType.Poker),
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
                                    result: PokerResultItemDto[],
                                    totalScore: CardDto): Promise<void> {
        const pokerMessageId = this.telegramDataService.getMessageId(lobbyId, chatId, TelegramMessageType.Poker);
        await this.bot.deleteMessage(chatId, String(pokerMessageId));
        this.telegramDataService.deleteMessageKey(lobbyId, TelegramMessageType.Poker, {
            chatId: chatId,
            messageId: pokerMessageId,
        });

        await this.bot.sendMessage(chatId, formatResult(pokerTheme, result, totalScore, telegramUserId), {
            parse_mode: MemberEnterSubscription.PARSE_MODE,
        });
    }

    private async initDestroyedLobbyMessage(chatId: number,
                                            lobbyId: number,
                                            lobbyName: string,
                                            memberId): Promise<void> {
        const lobbyMessageId = this.telegramDataService.getMessageId(lobbyId, chatId, TelegramMessageType.Lobby);
        await this.bot.editMessageReplyMarkup(null, {
            chat_id: chatId,
            message_id: lobbyMessageId,
        });

        const resultMessageId = this.telegramDataService.getMessageId(lobbyId, chatId, TelegramMessageType.Poker);
        if (resultMessageId) {
            await this.bot.deleteMessage(chatId, String(resultMessageId));
        }

        this.telegramDataService.deleteAllMessageKeysFromChat(lobbyId, chatId);
        this.telegramDataService.deleteMemberByMemberId(memberId);

        await this.bot.sendMessage(chatId, formatDestroyedLobby(lobbyName), {
            parse_mode: MemberEnterSubscription.PARSE_MODE,
        });
    }
}
