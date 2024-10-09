import 'reflect-metadata';

import {CalledWithMock, mock, MockProxy, mockReset} from 'jest-mock-extended';

import {container} from '@/config/inversify';
import {DAO_TYPES, TelegramMessageDAO} from '@/data/api';
import {TelegramMessage} from '@/data/entity';
import {TableName, TelegramMessageType} from '@/data/enum';
import TelegramMessageDAOImpl from '@/data/impl/TelegramMessageDAOImpl';
import {DatabaseClient, GRPC_CLIENT_TYPES} from '@/grpc-client/api';

describe('data/impl/TelegramMessageDAOImpl', () => {
  let telegramMessageDAO: TelegramMessageDAO;

  let dbClientMock: MockProxy<DatabaseClient>;

  beforeAll(() => {
    container
      .bind<TelegramMessageDAO>(DAO_TYPES.TelegramMessageDAO)
      .to(TelegramMessageDAOImpl);

    dbClientMock = mock<DatabaseClient>();
    container
      .bind<DatabaseClient>(GRPC_CLIENT_TYPES.DatabaseClient)
      .toConstantValue(dbClientMock);

    telegramMessageDAO = container.get<TelegramMessageDAO>(
      DAO_TYPES.TelegramMessageDAO
    );
  });

  beforeEach(() => {
    mockReset(dbClientMock);
  });

  it('addMessage must store message', async () => {
    const message: TelegramMessage = {
      lobby_id: 1,
      chat_id: 10,
      message_id: 100,
      message_type: TelegramMessageType.Poker,
    };

    await telegramMessageDAO.addMessage(message);
    expect(dbClientMock.save).toHaveBeenCalledWith(
      TableName.TelegramMessage,
      message
    );
  });

  it('getMessage must return stored message', async () => {
    const message: TelegramMessage = {
      id: 1,
      lobby_id: 10,
      chat_id: 100,
      message_id: 1000,
      message_type: TelegramMessageType.Poker,
    };

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<TelegramMessage[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramMessage, 'lobby_id', message.lobby_id)
      .mockReturnValue(Promise.resolve([message]));

    const receivedMessage = await telegramMessageDAO.getMessage(
      message.lobby_id,
      message.chat_id,
      message.message_type
    );

    expect(receivedMessage).toEqual(message);
  });

  it("getMessage mustn't return not stored message", async () => {
    const lobby_id = 1;
    const chat_id = 1;

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<TelegramMessage[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramMessage, 'lobby_id', lobby_id)
      .mockReturnValue(Promise.resolve([]));

    const receivedMessage = await telegramMessageDAO.getMessage(
      lobby_id,
      chat_id,
      TelegramMessageType.Poker
    );

    expect(receivedMessage).toBeNull();
  });

  it('getAllMessages must return all messages by lobby', async () => {
    const lobby_id = 1;
    const messages: TelegramMessage[] = [
      {
        lobby_id,
        chat_id: 10,
        message_id: 100,
        message_type: TelegramMessageType.Poker,
      },
      {
        lobby_id,
        chat_id: 20,
        message_id: 200,
        message_type: TelegramMessageType.Lobby,
      },
      {
        lobby_id,
        chat_id: 30,
        message_id: 300,
        message_type: TelegramMessageType.Poker,
      },
      {
        lobby_id,
        chat_id: 40,
        message_id: 400,
        message_type: TelegramMessageType.Lobby,
      },
    ];

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<TelegramMessage[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramMessage, 'lobby_id', lobby_id)
      .mockReturnValue(Promise.resolve(messages));

    const receivedMessages = await telegramMessageDAO.getAllMessages(lobby_id);

    expect(receivedMessages.length).toBe(messages.length);

    const messagesComparator = (
      left: TelegramMessage,
      right: TelegramMessage
    ) => left.chat_id - right.chat_id;
    const sortedMessages = messages.sort(messagesComparator);
    const sortedReceivedMessages = receivedMessages.sort(messagesComparator);
    sortedReceivedMessages.forEach((receivedMsg, i) => {
      expect(receivedMsg.chat_id).toBe(sortedMessages[i].chat_id);
      expect(receivedMsg.message_id).toBe(sortedMessages[i].message_id);
      expect(receivedMsg.message_type).toBe(sortedMessages[i].message_type);
    });
  });

  it('deleteMessageById must delete message', async () => {
    const message_id = 1;

    await telegramMessageDAO.deleteMessageById(message_id);
    expect(dbClientMock.delete).toHaveBeenCalledWith(
      TableName.TelegramMessage,
      'id',
      message_id
    );
  });

  it('deleteMessages must delete messages', async () => {
    const lobby_id = 1;
    const pokerMessages: TelegramMessage[] = [
      {
        id: 1,
        lobby_id,
        chat_id: 10,
        message_id: 100,
        message_type: TelegramMessageType.Poker,
      },
      {
        id: 3,
        lobby_id,
        chat_id: 30,
        message_id: 300,
        message_type: TelegramMessageType.Poker,
      },
      {
        id: 5,
        lobby_id,
        chat_id: 50,
        message_id: 500,
        message_type: TelegramMessageType.Poker,
      },
    ];
    const lobbyMessages: TelegramMessage[] = [
      {
        id: 2,
        lobby_id,
        chat_id: 20,
        message_id: 200,
        message_type: TelegramMessageType.Lobby,
      },
      {
        id: 4,
        lobby_id,
        chat_id: 40,
        message_id: 400,
        message_type: TelegramMessageType.Lobby,
      },
    ];

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<TelegramMessage[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramMessage, 'lobby_id', lobby_id)
      .mockReturnValue(Promise.resolve(pokerMessages.concat(lobbyMessages)));

    await telegramMessageDAO.deleteMessages(
      lobby_id,
      TelegramMessageType.Lobby
    );
    pokerMessages.forEach(msg => {
      expect(dbClientMock.delete).not.toHaveBeenCalledWith(
        TableName.TelegramMessage,
        'id',
        msg.id
      );
    });
    lobbyMessages.forEach(msg => {
      expect(dbClientMock.delete).toHaveBeenCalledWith(
        TableName.TelegramMessage,
        'id',
        msg.id
      );
    });
  });

  it('deleteAllMessages must delete all messages by lobby', async () => {
    const lobby_id = 1;

    await telegramMessageDAO.deleteAllMessages(lobby_id);
    expect(dbClientMock.delete).toHaveBeenCalledWith(
      TableName.TelegramMessage,
      'lobby_id',
      lobby_id
    );
  });

  it('deleteAllMessagesFromChat must delete all messages by lobby and chat', async () => {
    const lobby_id = 1;
    const chatId1 = 10;
    const chatId2 = 20;
    const chatMessages1: TelegramMessage[] = [
      {
        id: 1,
        lobby_id,
        chat_id: chatId1,
        message_id: 100,
        message_type: TelegramMessageType.Poker,
      },
      {
        id: 2,
        lobby_id,
        chat_id: chatId1,
        message_id: 200,
        message_type: TelegramMessageType.Lobby,
      },
      {
        id: 3,
        lobby_id,
        chat_id: chatId1,
        message_id: 300,
        message_type: TelegramMessageType.Poker,
      },
      {
        id: 4,
        lobby_id,
        chat_id: chatId1,
        message_id: 400,
        message_type: TelegramMessageType.Lobby,
      },
      {
        id: 5,
        lobby_id,
        chat_id: chatId1,
        message_id: 500,
        message_type: TelegramMessageType.Poker,
      },
    ];
    const chatMessages2: TelegramMessage[] = [
      {
        id: 6,
        lobby_id,
        chat_id: chatId2,
        message_id: 600,
        message_type: TelegramMessageType.Poker,
      },
      {
        id: 7,
        lobby_id,
        chat_id: chatId2,
        message_id: 700,
        message_type: TelegramMessageType.Lobby,
      },
      {
        id: 8,
        lobby_id,
        chat_id: chatId2,
        message_id: 800,
        message_type: TelegramMessageType.Poker,
      },
      {
        id: 9,
        lobby_id,
        chat_id: chatId2,
        message_id: 900,
        message_type: TelegramMessageType.Lobby,
      },
    ];

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<TelegramMessage[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramMessage, 'lobby_id', lobby_id)
      .mockReturnValue(Promise.resolve(chatMessages1.concat(chatMessages2)));

    await telegramMessageDAO.deleteAllMessagesFromChat(lobby_id, chatId1);
    chatMessages1.forEach(msg => {
      expect(dbClientMock.delete).toHaveBeenCalledWith(
        TableName.TelegramMessage,
        'id',
        msg.id
      );
    });
    chatMessages2.forEach(msg => {
      expect(dbClientMock.delete).not.toHaveBeenCalledWith(
        TableName.TelegramMessage,
        'id',
        msg.id
      );
    });
  });
});
