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
      lobbyId: 1,
      chatId: 10,
      messageId: 100,
      messageType: TelegramMessageType.Poker,
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
      lobbyId: 10,
      chatId: 100,
      messageId: 1000,
      messageType: TelegramMessageType.Poker,
    };

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<TelegramMessage[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramMessage, 'lobbyId', message.lobbyId)
      .mockReturnValue(Promise.resolve([message]));

    const receivedMessage = await telegramMessageDAO.getMessage(
      message.lobbyId,
      message.chatId,
      message.messageType
    );

    expect(receivedMessage).toEqual(message);
  });

  it("getMessage mustn't return not stored message", async () => {
    const lobbyId = 1;
    const chatId = 1;

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<TelegramMessage[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramMessage, 'lobbyId', lobbyId)
      .mockReturnValue(Promise.resolve([]));

    const receivedMessage = await telegramMessageDAO.getMessage(
      lobbyId,
      chatId,
      TelegramMessageType.Poker
    );

    expect(receivedMessage).toBeNull();
  });

  it('getAllMessages must return all messages by lobby', async () => {
    const lobbyId = 1;
    const messages: TelegramMessage[] = [
      {
        lobbyId,
        chatId: 10,
        messageId: 100,
        messageType: TelegramMessageType.Poker,
      },
      {
        lobbyId,
        chatId: 20,
        messageId: 200,
        messageType: TelegramMessageType.Lobby,
      },
      {
        lobbyId,
        chatId: 30,
        messageId: 300,
        messageType: TelegramMessageType.Poker,
      },
      {
        lobbyId,
        chatId: 40,
        messageId: 400,
        messageType: TelegramMessageType.Lobby,
      },
    ];

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<TelegramMessage[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramMessage, 'lobbyId', lobbyId)
      .mockReturnValue(Promise.resolve(messages));

    const receivedMessages = await telegramMessageDAO.getAllMessages(lobbyId);

    expect(receivedMessages.length).toBe(messages.length);

    const messagesComparator = (
      left: TelegramMessage,
      right: TelegramMessage
    ) => left.chatId - right.chatId;
    const sortedMessages = messages.sort(messagesComparator);
    const sortedReceivedMessages = receivedMessages.sort(messagesComparator);
    sortedReceivedMessages.forEach((receivedMsg, i) => {
      expect(receivedMsg.chatId).toBe(sortedMessages[i].chatId);
      expect(receivedMsg.messageId).toBe(sortedMessages[i].messageId);
      expect(receivedMsg.messageType).toBe(sortedMessages[i].messageType);
    });
  });

  it('deleteMessageById must delete message', async () => {
    const messageId = 1;

    await telegramMessageDAO.deleteMessageById(messageId);
    expect(dbClientMock.delete).toHaveBeenCalledWith(
      TableName.TelegramMessage,
      'id',
      messageId
    );
  });

  it('deleteMessages must delete messages', async () => {
    const lobbyId = 1;
    const pokerMessages: TelegramMessage[] = [
      {
        id: 1,
        lobbyId,
        chatId: 10,
        messageId: 100,
        messageType: TelegramMessageType.Poker,
      },
      {
        id: 3,
        lobbyId,
        chatId: 30,
        messageId: 300,
        messageType: TelegramMessageType.Poker,
      },
      {
        id: 5,
        lobbyId,
        chatId: 50,
        messageId: 500,
        messageType: TelegramMessageType.Poker,
      },
    ];
    const lobbyMessages: TelegramMessage[] = [
      {
        id: 2,
        lobbyId,
        chatId: 20,
        messageId: 200,
        messageType: TelegramMessageType.Lobby,
      },
      {
        id: 4,
        lobbyId,
        chatId: 40,
        messageId: 400,
        messageType: TelegramMessageType.Lobby,
      },
    ];

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<TelegramMessage[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramMessage, 'lobbyId', lobbyId)
      .mockReturnValue(Promise.resolve(pokerMessages.concat(lobbyMessages)));

    await telegramMessageDAO.deleteMessages(lobbyId, TelegramMessageType.Lobby);
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
    const lobbyId = 1;

    await telegramMessageDAO.deleteAllMessages(lobbyId);
    expect(dbClientMock.delete).toHaveBeenCalledWith(
      TableName.TelegramMessage,
      'lobbyId',
      lobbyId
    );
  });

  it('deleteAllMessagesFromChat must delete all messages by lobby and chat', async () => {
    const lobbyId = 1;
    const chatId1 = 10;
    const chatId2 = 20;
    const chatMessages1: TelegramMessage[] = [
      {
        id: 1,
        lobbyId,
        chatId: chatId1,
        messageId: 100,
        messageType: TelegramMessageType.Poker,
      },
      {
        id: 2,
        lobbyId,
        chatId: chatId1,
        messageId: 200,
        messageType: TelegramMessageType.Lobby,
      },
      {
        id: 3,
        lobbyId,
        chatId: chatId1,
        messageId: 300,
        messageType: TelegramMessageType.Poker,
      },
      {
        id: 4,
        lobbyId,
        chatId: chatId1,
        messageId: 400,
        messageType: TelegramMessageType.Lobby,
      },
      {
        id: 5,
        lobbyId,
        chatId: chatId1,
        messageId: 500,
        messageType: TelegramMessageType.Poker,
      },
    ];
    const chatMessages2: TelegramMessage[] = [
      {
        id: 6,
        lobbyId,
        chatId: chatId2,
        messageId: 600,
        messageType: TelegramMessageType.Poker,
      },
      {
        id: 7,
        lobbyId,
        chatId: chatId2,
        messageId: 700,
        messageType: TelegramMessageType.Lobby,
      },
      {
        id: 8,
        lobbyId,
        chatId: chatId2,
        messageId: 800,
        messageType: TelegramMessageType.Poker,
      },
      {
        id: 9,
        lobbyId,
        chatId: chatId2,
        messageId: 900,
        messageType: TelegramMessageType.Lobby,
      },
    ];

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<TelegramMessage[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramMessage, 'lobbyId', lobbyId)
      .mockReturnValue(Promise.resolve(chatMessages1.concat(chatMessages2)));

    await telegramMessageDAO.deleteAllMessagesFromChat(lobbyId, chatId1);
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
