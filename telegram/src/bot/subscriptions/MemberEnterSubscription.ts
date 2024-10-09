import {injectable, inject} from 'inversify';
import {Message} from 'node-telegram-bot-api';
import {Observable} from 'rxjs';

import {TelegramMessageType} from '@/data/enum';
import {
  LobbyEvent,
  EventType,
  MembersWasChangedLobbyEvent,
  PokerResultWasChangedLobbyEvent,
  PokerWasFinishedLobbyEvent,
} from '@/grpc-client/event';
import {
  SERVICE_TYPES,
  TelegramMessageService,
  TelegramUserService,
  LobbyService,
  SubscriptionService,
} from '@/service/api';

import {TELEGRAM_BOT_TYPES} from '../bot';
import {ButtonCommand} from '../enum';
import {
  formatLobby,
  formatPoker,
  formatFinishResult,
  formatDestroyedLobby,
  fromTelegramUserToMember,
} from '../utils';

import AbstractMessageSubscription from './AbstractMessageSubscription';

interface LobbyEventContext {
  chat_id: number;
  telegramUserId: number;
  lobby_id: number;
  lobbyName: string;
  memberId: number;
}

type LobbyEventHandler = (
  eventContext: LobbyEventContext,
  payload: LobbyEvent['payload']
) => Promise<void>;

@injectable()
export default class MemberEnterSubscription extends AbstractMessageSubscription {
  @inject(SERVICE_TYPES.TelegramMessageService)
  private readonly telegramMessageService: TelegramMessageService;

  @inject(SERVICE_TYPES.TelegramUserService)
  private readonly telegramUserService: TelegramUserService;

  @inject(SERVICE_TYPES.LobbyService)
  private readonly lobbyService: LobbyService;

  @inject(SERVICE_TYPES.SubscriptionService)
  private readonly subscriptionService: SubscriptionService;

  constructor(
    @inject(TELEGRAM_BOT_TYPES.PlaintTexts$) messages$: Observable<Message>
  ) {
    super(messages$);

    this.membersWasChangedHandler = this.membersWasChangedHandler.bind(this);
    this.pokerResultWasChangedHandler =
      this.pokerResultWasChangedHandler.bind(this);
    this.pokerWasFinishedHandler = this.pokerWasFinishedHandler.bind(this);
    this.lobbyWasDestroyedHandler = this.lobbyWasDestroyedHandler.bind(this);
  }

  protected async handle(msg: Message): Promise<void> {
    if (await this.telegramUserService.isMemberExists(msg.from.id)) {
      return;
    }

    const {
      chat: {id: chat_id},
      from: {id: telegramUserId},
    } = msg;
    const lobbyName = msg.text.trim().toUpperCase();

    const {id: lobby_id} =
      (await this.lobbyService.getByName(lobbyName)) ||
      (await this.lobbyService.createLobby(lobbyName));
    const {id: memberId} = await this.telegramUserService.createMember(
      fromTelegramUserToMember(msg.from)
    );

    const eventContext = {
      chat_id,
      telegramUserId,
      lobby_id,
      lobbyName,
      memberId,
    };

    await this.subscriptionService
      .subscribe(lobby_id, memberId)
      .then(event =>
        this.resolveLobbyEventHandler(event.type)(eventContext, event.payload)
      )
      .then(() => this.lobbyService.enterMember(memberId, lobby_id))
      .catch(error => this.handleError(error));
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
        throw new Error('Unhandled lobby event: ' + eventType);
    }
  }

  private async membersWasChangedHandler(
    eventContext: LobbyEventContext,
    payload: MembersWasChangedLobbyEvent['payload']
  ): Promise<void> {
    const {chat_id, telegramUserId, lobby_id, lobbyName} = eventContext;
    const {members} = payload;

    const message = await this.telegramMessageService.getMessage(
      lobby_id,
      chat_id,
      TelegramMessageType.Lobby
    );

    if (message) {
      await this.bot.editMessageText(
        formatLobby(lobbyName, members, telegramUserId),
        {
          chat_id: chat_id,
          message_id: message.message_id,
          parse_mode: MemberEnterSubscription.PARSE_MODE,
          reply_markup: {
            inline_keyboard:
              MemberEnterSubscription.INLINE_KEYBOARD[ButtonCommand.Leave],
          },
        }
      );
    } else {
      const lobbyMsg = await this.bot.sendMessage(
        chat_id,
        formatLobby(lobbyName, members, telegramUserId),
        {
          parse_mode: MemberEnterSubscription.PARSE_MODE,
          reply_markup: {
            inline_keyboard:
              MemberEnterSubscription.INLINE_KEYBOARD[ButtonCommand.Leave],
          },
        }
      );
      await this.telegramMessageService.addMessage({
        lobby_id,
        chat_id: lobbyMsg.chat.id,
        message_id: lobbyMsg.message_id,
        message_type: TelegramMessageType.Lobby,
      });
    }
  }

  private async pokerResultWasChangedHandler(
    eventContext: LobbyEventContext,
    payload: PokerResultWasChangedLobbyEvent['payload']
  ): Promise<void> {
    const {chat_id, memberId, lobby_id} = eventContext;
    const {theme, result} = payload;

    const message = await this.telegramMessageService.getMessage(
      lobby_id,
      chat_id,
      TelegramMessageType.Poker
    );
    const messageText = formatPoker(theme, result, memberId);

    if (message) {
      const card = result.find(
        resultItem => resultItem.member.id === memberId
      ).card;

      await this.bot.editMessageText(messageText, {
        chat_id: chat_id,
        message_id: message.message_id,
        parse_mode: MemberEnterSubscription.PARSE_MODE,
        reply_markup: {
          inline_keyboard: card
            ? MemberEnterSubscription.INLINE_KEYBOARD[ButtonCommand.RemoveCard]
            : MemberEnterSubscription.INLINE_KEYBOARD[ButtonCommand.PutCard],
        },
      });
    } else {
      const pokerResultMsg = await this.bot.sendMessage(chat_id, messageText, {
        parse_mode: MemberEnterSubscription.PARSE_MODE,
        reply_markup: {
          inline_keyboard:
            MemberEnterSubscription.INLINE_KEYBOARD[ButtonCommand.PutCard],
        },
      });
      await this.telegramMessageService.addMessage({
        lobby_id,
        chat_id: pokerResultMsg.chat.id,
        message_id: pokerResultMsg.message_id,
        message_type: TelegramMessageType.Poker,
      });
    }
  }

  private async pokerWasFinishedHandler(
    eventContext: LobbyEventContext,
    payload: PokerWasFinishedLobbyEvent['payload']
  ): Promise<void> {
    const {chat_id, telegramUserId, lobby_id} = eventContext;
    const {theme, result} = payload;

    const pokerMessage = await this.telegramMessageService.getMessage(
      lobby_id,
      chat_id,
      TelegramMessageType.Poker
    );
    await this.bot.deleteMessage(chat_id, String(pokerMessage.message_id));
    await this.telegramMessageService.deleteMessageById(pokerMessage.id);

    await this.bot.sendMessage(
      chat_id,
      formatFinishResult(theme, result, telegramUserId),
      {
        parse_mode: MemberEnterSubscription.PARSE_MODE,
      }
    );
  }

  private async lobbyWasDestroyedHandler(
    eventContext: LobbyEventContext
  ): Promise<void> {
    const {chat_id, lobby_id, lobbyName, memberId} = eventContext;

    const lobbyMessage = await this.telegramMessageService.getMessage(
      lobby_id,
      chat_id,
      TelegramMessageType.Lobby
    );
    await this.bot.editMessageReplyMarkup(null, {
      chat_id: chat_id,
      message_id: lobbyMessage.message_id,
    });

    const resultMessage = await this.telegramMessageService.getMessage(
      lobby_id,
      chat_id,
      TelegramMessageType.Poker
    );
    if (resultMessage) {
      await this.bot.deleteMessage(chat_id, String(resultMessage.message_id));
    }

    await this.telegramMessageService.deleteAllMessagesFromChat(
      lobby_id,
      chat_id
    );
    await this.telegramUserService.deleteMemberByMemberId(memberId);

    await this.bot.sendMessage(chat_id, formatDestroyedLobby(lobbyName), {
      parse_mode: MemberEnterSubscription.PARSE_MODE,
      disable_notification: true,
    });
  }
}
