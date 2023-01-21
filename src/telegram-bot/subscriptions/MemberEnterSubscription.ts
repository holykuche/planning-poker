import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { LobbyState, TelegramMessageType } from "data/enum";
import { LobbyService, SERVICE_TYPES, SubscriptionService, TelegramDataService } from "service/api";
import { EventType } from "service/event";
import { PokerResultItemDto } from "service/dto";

import { ButtonCommand } from "../enum";
import { formatMembers, formatPokerFinishResult, formatPokerResult, fromTelegramUserToMember, italic } from "../utils";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class MemberEnterSubscription extends TelegramBotSubscription<Message> {

    private static readonly ENTER_REGEXP = /^\/enter (\w+)$/;
    private static readonly PARSE_MODE = "MarkdownV2";

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
                    const member = this.telegramDataService.saveMember(fromTelegramUserToMember(msg.from));
                    const lobby = this.lobbyService.enterMember(member.id, lobbyName);

                    this.subscriptionService.subscribe(lobby.id, member.id, async event => {
                        switch (event.type) {
                            case EventType.MembersWasChanged:
                                await this.bot.editMessageText(formatMembers(event.payload.members, msg.from.id), {
                                    chat_id: msg.chat.id,
                                    message_id: this.telegramDataService.getMessageId(lobby.id, msg.chat.id, TelegramMessageType.Members),
                                    parse_mode: MemberEnterSubscription.PARSE_MODE,
                                });
                                break;
                            case EventType.PokerWasStarted:
                                await this.initStartPokerMessages(msg.chat.id, msg.from.id, lobby.id, event.payload.theme, event.payload.result);
                                break;
                            case EventType.PokerResultWasChanged:
                                const card = event.payload.result
                                    .find(resultItem => resultItem.member.id === member.id)
                                    .card;
                                await this.bot.editMessageText(formatPokerResult(event.payload.result, msg.from.id), {
                                    chat_id: msg.chat.id,
                                    message_id: this.telegramDataService.getMessageId(lobby.id, msg.chat.id, TelegramMessageType.Result),
                                    parse_mode: MemberEnterSubscription.PARSE_MODE,
                                    reply_markup: {
                                        inline_keyboard: card
                                            ? MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.RemoveCard ]
                                            : MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.PutCard ],
                                    },
                                });
                                break;
                            case EventType.PokerWasFinished:
                                await this.bot.editMessageReplyMarkup(null, {
                                    chat_id: msg.chat.id,
                                    message_id: this.telegramDataService.getMessageId(lobby.id, msg.chat.id, TelegramMessageType.Result),
                                });

                                await this.bot.sendMessage(msg.chat.id, formatPokerFinishResult(event.payload.result, msg.from.id), {
                                    parse_mode: MemberEnterSubscription.PARSE_MODE,
                                });

                                this.telegramDataService.deleteMessageKeys(lobby.id, TelegramMessageType.Result);
                                break;
                            default:
                                throw new Error(`Unexpectable event type "${event.type}"`);
                        }
                    });

                    const lobbyMsg = await this.bot.sendMessage(msg.chat.id, `Lobby: ${italic(lobbyName)}`, {
                        parse_mode: MemberEnterSubscription.PARSE_MODE,
                        reply_markup: {
                            inline_keyboard: MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.Leave ],
                        },
                    });
                    this.telegramDataService.addMessageKey(lobby.id, TelegramMessageType.Lobby, {
                        chatId: lobbyMsg.chat.id,
                        messageId: lobbyMsg.message_id,
                    });

                    const members = this.lobbyService.getMembers(lobby.id);
                    const membersMsg = await this.bot.sendMessage(msg.chat.id, formatMembers(members, msg.from.id), {
                        parse_mode: MemberEnterSubscription.PARSE_MODE,
                    });
                    this.telegramDataService.addMessageKey(lobby.id, TelegramMessageType.Members, {
                        chatId: membersMsg.chat.id,
                        messageId: membersMsg.message_id,
                    });

                    if (lobby.state === LobbyState.Playing) {
                        const pokerResult = this.lobbyService.getPokerResult(lobby.id);
                        await this.initStartPokerMessages(msg.chat.id, msg.from.id, lobby.id, lobby.currentTheme, pokerResult);
                    }
                } catch (error) {
                    console.log(error);
                }
            });
    }

    private async initStartPokerMessages(chatId: number,
                                         telegramUserId: number,
                                         lobbyId: number,
                                         theme: string,
                                         pokerResult: PokerResultItemDto[]) {
        await this.bot.sendMessage(chatId, `Poker's theme: ${italic(theme)}`, {
            parse_mode: MemberEnterSubscription.PARSE_MODE,
        });
        const pokerResultMsg = await this.bot.sendMessage(chatId, formatPokerResult(pokerResult, telegramUserId), {
            parse_mode: MemberEnterSubscription.PARSE_MODE,
            reply_markup: {
                inline_keyboard: MemberEnterSubscription.INLINE_KEYBOARD[ ButtonCommand.PutCard ],
            },
        });
        this.telegramDataService.addMessageKey(lobbyId, TelegramMessageType.Result, {
            chatId: pokerResultMsg.chat.id,
            messageId: pokerResultMsg.message_id,
        });
    }
}
