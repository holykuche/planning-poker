import "reflect-metadata";

import { TelegramMessage } from "data/entity";
import { TelegramMessageType } from "data/enum";

import TelegramMessageDAOImpl from "data/in-memory-impl/TelegramMessageDAOImpl";

describe("data/in-memory-impl/TelegramMessageDAOImpl", () => {
    
    let telegramMessageDAO: TelegramMessageDAOImpl;
    
    beforeEach(() => {
        telegramMessageDAO = new TelegramMessageDAOImpl();
    });

    it("addMessage should assign ID to message without ID", () => {
        const message: TelegramMessage = {
            lobbyId: 1,
            chatId: 10,
            messageId: 100,
            messageType: TelegramMessageType.Poker,
        };

        const storedMessage = telegramMessageDAO.addMessage(message);

        expect(storedMessage.id).toBeDefined();
    });

    it("addMessage should return message with the same property values", () => {
        const message: TelegramMessage = {
            lobbyId: 1,
            chatId: 10,
            messageId: 100,
            messageType: TelegramMessageType.Poker,
        };

        const storedMessage = telegramMessageDAO.addMessage(message);

        expect(storedMessage.lobbyId).toBe(message.lobbyId);
        expect(storedMessage.chatId).toBe(message.chatId);
        expect(storedMessage.messageId).toBe(message.messageId);
        expect(storedMessage.messageType).toBe(message.messageType);
    });

    it("addMessage should store message", () => {
        const message: TelegramMessage = {
            lobbyId: 1,
            chatId: 10,
            messageId: 100,
            messageType: TelegramMessageType.Poker,
        };

        const storedMessage = telegramMessageDAO.addMessage(message);
        const receivedMessage = telegramMessageDAO.find("id", storedMessage.id);
        
        expect(receivedMessage).toEqual(storedMessage);
    });

    it("getMessage should return stored message", () => {
        const message: TelegramMessage = {
            lobbyId: 1,
            chatId: 10,
            messageId: 100,
            messageType: TelegramMessageType.Poker,
        };

        const storedMessage = telegramMessageDAO.addMessage(message);
        const receivedMessage = telegramMessageDAO.getMessage(message.lobbyId, message.chatId, message.messageType);

        expect(receivedMessage).toEqual(storedMessage);
    });

    it("getMessage shouldn't return not stored message", () => {
        const receivedMessage = telegramMessageDAO.getMessage(1, 10, TelegramMessageType.Poker);

        expect(receivedMessage).toBeNull();
    });

    it("getAllMessages should return all messages by lobby", () => {
        const lobbyId = 1;
        const messages: TelegramMessage[] = [
            { lobbyId, chatId: 10, messageId: 100, messageType: TelegramMessageType.Poker },
            { lobbyId, chatId: 20, messageId: 200, messageType: TelegramMessageType.Lobby },
            { lobbyId, chatId: 30, messageId: 300, messageType: TelegramMessageType.Poker },
            { lobbyId, chatId: 40, messageId: 400, messageType: TelegramMessageType.Lobby },
        ];

        messages.forEach(msg => telegramMessageDAO.addMessage(msg));

        const receivedMessages = telegramMessageDAO.getAllMessages(lobbyId);

        expect(receivedMessages.length).toBe(messages.length);

        const messagesComparator = (left: TelegramMessage, right: TelegramMessage) => left.chatId - right.chatId;
        const sortedMessages = messages.sort(messagesComparator);
        const sortedReceivedMessages = receivedMessages.sort(messagesComparator);
        sortedReceivedMessages.forEach((receivedMsg, i) => {
            expect(receivedMsg.chatId).toBe(sortedMessages[ i ].chatId);
            expect(receivedMsg.messageId).toBe(sortedMessages[ i ].messageId);
            expect(receivedMsg.messageType).toBe(sortedMessages[ i ].messageType);
        });
    });

    it("deleteMessageById should delete message", () => {
        const message: TelegramMessage = {
            lobbyId: 1,
            chatId: 10,
            messageId: 100,
            messageType: TelegramMessageType.Poker,
        };

        const storedMessage = telegramMessageDAO.addMessage(message);
        expect(telegramMessageDAO.find("id", storedMessage.id)).toEqual(storedMessage);

        telegramMessageDAO.deleteMessageById(storedMessage.id);
        expect(telegramMessageDAO.find("id", storedMessage.id)).toBeNull();
    });

    it("deleteMessages should delete messages", () => {
        const lobbyId = 1;
        const pokerMessages: TelegramMessage[] = [
            { lobbyId, chatId: 10, messageId: 100, messageType: TelegramMessageType.Poker },
            { lobbyId, chatId: 30, messageId: 300, messageType: TelegramMessageType.Poker },
            { lobbyId, chatId: 50, messageId: 500, messageType: TelegramMessageType.Poker },
        ];
        const lobbyMessages: TelegramMessage[] = [
            { lobbyId, chatId: 20, messageId: 200, messageType: TelegramMessageType.Lobby },
            { lobbyId, chatId: 40, messageId: 400, messageType: TelegramMessageType.Lobby },
        ];

        pokerMessages.concat(lobbyMessages).forEach(msg => telegramMessageDAO.addMessage(msg));

        telegramMessageDAO.deleteMessages(lobbyId, TelegramMessageType.Lobby);

        const receivedMessages = telegramMessageDAO.getAllMessages(lobbyId);
        const receivedPokerMessages = receivedMessages.filter(msg => msg.messageType === TelegramMessageType.Poker);
        const receivedLobbyMessages = receivedMessages.filter(msg => msg.messageType === TelegramMessageType.Lobby);

        expect(receivedPokerMessages.length).toBe(pokerMessages.length);
        expect(receivedLobbyMessages.length).toBe(0);
    });

    it("deleteAllMessages should delete all messages by lobby", () => {
        const lobbyId = 1;
        const messages: TelegramMessage[] = [
            { lobbyId, chatId: 10, messageId: 100, messageType: TelegramMessageType.Poker },
            { lobbyId, chatId: 20, messageId: 200, messageType: TelegramMessageType.Lobby },
            { lobbyId, chatId: 30, messageId: 300, messageType: TelegramMessageType.Poker },
            { lobbyId, chatId: 40, messageId: 400, messageType: TelegramMessageType.Lobby },
        ];

        messages.forEach(msg => telegramMessageDAO.addMessage(msg));

        telegramMessageDAO.deleteAllMessages(lobbyId);

        const receivedMessages = telegramMessageDAO.getAllMessages(lobbyId);
        expect(receivedMessages.length).toBe(0);
    });

    it("deleteAllMessagesFromChat should delete all messages by lobby and chat", () => {
        const lobbyId = 1;
        const chatId1 = 10;
        const chatId2 = 20;
        const chatMessages1: TelegramMessage[] = [
            { lobbyId, chatId: chatId1, messageId: 100, messageType: TelegramMessageType.Poker },
            { lobbyId, chatId: chatId1, messageId: 200, messageType: TelegramMessageType.Lobby },
            { lobbyId, chatId: chatId1, messageId: 300, messageType: TelegramMessageType.Poker },
            { lobbyId, chatId: chatId1, messageId: 400, messageType: TelegramMessageType.Lobby },
            { lobbyId, chatId: chatId1, messageId: 500, messageType: TelegramMessageType.Poker },
        ];
        const chatMessages2: TelegramMessage[] = [
            { lobbyId, chatId: chatId2, messageId: 600, messageType: TelegramMessageType.Poker },
            { lobbyId, chatId: chatId2, messageId: 700, messageType: TelegramMessageType.Lobby },
            { lobbyId, chatId: chatId2, messageId: 800, messageType: TelegramMessageType.Poker },
            { lobbyId, chatId: chatId2, messageId: 900, messageType: TelegramMessageType.Lobby },
        ];

        chatMessages1.concat(chatMessages2).forEach(msg => telegramMessageDAO.addMessage(msg));

        telegramMessageDAO.deleteAllMessagesFromChat(lobbyId, chatId1);

        const receivedMessages = telegramMessageDAO.getAllMessages(lobbyId);
        const receivedChatMessages1 = receivedMessages.filter(msg => msg.chatId === chatId1);
        const receivedChatMessages2 = receivedMessages.filter(msg => msg.chatId === chatId2);

        expect(receivedChatMessages1.length).toBe(0);
        expect(receivedChatMessages2.length).toBe(chatMessages2.length);
    });
});
