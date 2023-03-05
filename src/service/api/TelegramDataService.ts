import { TelegramMessage } from "data/entity";
import { TelegramMessageType } from "data/enum";

import { MemberDto } from "../dto";

export default interface TelegramDataService {
    getMessage(lobbyId: number, chatId: number, messageType: TelegramMessageType): TelegramMessage;

    getMessages(lobbyId: number, messageType: TelegramMessageType): TelegramMessage[];

    addMessage(message: TelegramMessage): void;

    deleteMessageById(messageId: number): void;

    deleteMessages(lobbyId: number, messageType: TelegramMessageType): void;

    deleteAllMessages(lobbyId: number): void;

    deleteAllMessagesFromChat(lobbyId: number, chatId: number): void;

    getMemberByTelegramUserId(telegramUserId: number): MemberDto;

    createMember(member: MemberDto): MemberDto;

    isMemberExists(telegramUserId: number): boolean;

    deleteMemberByMemberId(memberId: number): void;

    deleteMemberByTelegramUserId(telegramUserId: number): void;
}
