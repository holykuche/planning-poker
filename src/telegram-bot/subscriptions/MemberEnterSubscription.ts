import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { LobbyState, TelegramMessageType } from "data/enum";
import { LobbyService, SERVICE_TYPES, SubscriptionService, TelegramDataService } from "service/api";
import { EventType } from "service/event";
import { PokerResultItemDto } from "service/dto";

import { ButtonCommand } from "../enum";
import { formatLobby, formatPoker, formatResult, formatDestroyedLobby, fromTelegramUserToMember } from "../utils";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class MemberEnterSubscription extends TelegramBotSubscription<Message> {

    private static readonly ENTER_REGEXP = /^\/enter (\w+)$/;

    @lazyInject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;
    @lazyInject(SERVICE_TYPES.SubscriptionService) private readonly subscriptionService: SubscriptionService;

    constructor(messages$: Observable<Message>, bot: TelegramBot) {
        const memberEnterMessages$ = messages$
            .pipe(
                filter(msg => MemberEnterSubscription.ENTER_REGEXP.test(msg.text))
            );
        super(memberEnterMessages$, bot);
    }

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async msg => {
                const lobbyName = msg.text.match(MemberEnterSubscription.ENTER_REGEXP)[ 1 ];

                try {
                    const member = this.telegramDataService.createMember(fromTelegramUserToMember(msg.from));
                    const lobby = this.lobbyService.enterMember(member.id, lobbyName);

                    this.subscriptionService.subscribe(lobby.id, member.id, async event => {
                        switch (event.type) {
                            case EventType.MembersWasChanged:
                                await this.bot.editMessageText(formatLobby(lobbyName, event.payload.members, msg.from.id), {
                                    chat_id: msg.chat.id,
                                    message_id: this.telegramDataService.getMessageId(lobby.id, msg.chat.id, TelegramMessageType.Lobby),
                                    parse_mode: MemberEnterSubscription.PARSE_MODE,
                                    reply_markup: {
                                        inline_keyboard: MemberEnterSubscription.INLINE_KEYBOARD[ButtonCommand.Leave],
                                    },
                                });
                                break;
                            case EventType.PokerWasStarted:
                                await this.initStartPokerMessages(msg.chat.id, msg.from.id, lobby.id, event.payload.theme, event.payload.result);
                                break;
                            case EventType.PokerResultWasChanged:
                                const card = event.payload.result
                                    .find(resultItem => resultItem.member.id === member.id)
                                    .card;
                                await this.bot.editMessageText(formatPoker(
                                    this.lobbyService.getById(lobby.id).currentTheme,
                                    event.payload.result,
                                    msg.from.id),
                                    {
                                        chat_id: msg.chat.id,
                                        message_id: this.telegramDataService.getMessageId(lobby.id, msg.chat.id, TelegramMessageType.Poker),
                                        parse_mode: MemberEnterSubscription.PARSE_MODE,
                                        reply_markup: {
                                            inline_keyboard: card
                                                ? MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.RemoveCard ]
                                                : MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.PutCard ],
                                        },
                                    });
                                break;
                            case EventType.PokerWasFinished:
                                const pokerMessageId = this.telegramDataService.getMessageId(lobby.id, msg.chat.id, TelegramMessageType.Poker);
                                await this.bot.deleteMessage(msg.chat.id, String(pokerMessageId));
                                this.telegramDataService.deleteMessageKey(lobby.id, TelegramMessageType.Poker, {
                                    chatId: msg.chat.id,
                                    messageId: pokerMessageId,
                                });

                                await this.bot.sendMessage(msg.chat.id, formatResult(
                                    event.payload.theme,
                                    event.payload.result,
                                    event.payload.totalScore,
                                    msg.from.id),
                                    {
                                        parse_mode: MemberEnterSubscription.PARSE_MODE,
                                    });

                                break;
                            case EventType.LobbyWasDestroyed:
                                const lobbyMessageId = this.telegramDataService.getMessageId(event.payload.lobby.id, msg.chat.id, TelegramMessageType.Lobby);
                                await this.bot.editMessageReplyMarkup(null, {
                                    chat_id: msg.chat.id,
                                    message_id: lobbyMessageId,
                                });

                                const resultMessageId = this.telegramDataService.getMessageId(event.payload.lobby.id, msg.chat.id, TelegramMessageType.Poker);
                                if (resultMessageId) {
                                    await this.bot.deleteMessage(msg.chat.id, String(resultMessageId));
                                }

                                this.telegramDataService.deleteAllMessageKeysFromChat(event.payload.lobby.id, msg.chat.id);
                                this.telegramDataService.deleteMemberByMemberId(member.id);

                                await this.bot.sendMessage(msg.chat.id, formatDestroyedLobby(event.payload.lobby.name), {
                                    parse_mode: MemberEnterSubscription.PARSE_MODE,
                                });
                                break;
                            default:
                        }
                    });

                    const members = this.lobbyService.getMembers(lobby.id);

                    const lobbyMsg = await this.bot.sendMessage(msg.chat.id, formatLobby(lobbyName, members, msg.from.id), {
                        parse_mode: MemberEnterSubscription.PARSE_MODE,
                        reply_markup: {
                            inline_keyboard: MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.Leave ],
                        },
                    });
                    this.telegramDataService.addMessageKey(lobby.id, TelegramMessageType.Lobby, {
                        chatId: lobbyMsg.chat.id,
                        messageId: lobbyMsg.message_id,
                    });

                    if (lobby.state === LobbyState.Playing) {
                        const pokerResult = this.lobbyService.getPokerResult(lobby.id);
                        await this.initStartPokerMessages(msg.chat.id, msg.from.id, lobby.id, lobby.currentTheme, pokerResult);
                    }
                } catch (error) {
                    await this.handleError(msg.chat.id, error);
                }
            });
    }

    private async initStartPokerMessages(chatId: number,
                                         telegramUserId: number,
                                         lobbyId: number,
                                         theme: string,
                                         pokerResult: PokerResultItemDto[]) {
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
}
