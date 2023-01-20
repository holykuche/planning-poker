import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { LobbyState } from "data/enum";
import { LobbyService, SERVICE_TYPES, SubscriptionService, TelegramDataService } from "service/api";
import { EventType } from "service/event";
import { PokerResultItemDto } from "service/dto";

import { formatMembers, formatPokerFinishResult, formatPokerResult, fromTelegramUserToMember, italic } from "../utils";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class MemberEnterSubscription extends TelegramBotSubscription {

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
        return this.messages$
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
                                    message_id: this.telegramDataService.getMembersMessageId(lobby.id, msg.chat.id),
                                    parse_mode: MemberEnterSubscription.PARSE_MODE,
                                });
                                break;
                            case EventType.PokerWasStarted:
                                await this.initStartPokerMessages(msg.chat.id, msg.from.id, lobby.id, event.payload.theme, event.payload.result);
                                break;
                            case EventType.PokerResultWasChanged:
                                await this.bot.editMessageText(formatPokerResult(event.payload.result, msg.from.id), {
                                    chat_id: msg.chat.id,
                                    message_id: this.telegramDataService.getResultMessageId(lobby.id, msg.chat.id),
                                    parse_mode: MemberEnterSubscription.PARSE_MODE,
                                });
                                break;
                            case EventType.PokerWasFinished:
                                await this.bot.sendMessage(msg.chat.id, formatPokerFinishResult(event.payload.result, msg.from.id), {
                                    parse_mode: MemberEnterSubscription.PARSE_MODE,
                                });
                                this.telegramDataService.deleteAllResultMessageKeys(lobby.id);
                                break;
                            default:
                                throw new Error(`Unexpectable event type "${event.type}"`);
                        }
                    });

                    await this.bot.sendMessage(msg.chat.id, `Lobby: ${italic(lobbyName)}`, {
                        parse_mode: MemberEnterSubscription.PARSE_MODE,
                    });

                    const members = this.lobbyService.getMembers(lobby.id);
                    const membersMsg = await this.bot.sendMessage(msg.chat.id, formatMembers(members, msg.from.id), {
                        parse_mode: MemberEnterSubscription.PARSE_MODE,
                    });
                    this.telegramDataService.addMembersMessageKey(lobby.id, {
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
        });
        this.telegramDataService.addResultMessageKey(lobbyId, {
            chatId: pokerResultMsg.chat.id,
            messageId: pokerResultMsg.message_id,
        });
    }
}
