import { TelegramMessageKey } from "data/entity";
import { TelegramMessageType } from "data/enum";

import { MemberDto } from "../dto";

export default interface TelegramDataService {
    getMessageId(lobbyId: number, chatId: number, messageType: TelegramMessageType): number;
    addMessageKey(lobbyId: number, messageType: TelegramMessageType, messageKey: TelegramMessageKey): void;
    deleteMessageKey(lobbyId: number, messageType: TelegramMessageType, messageKey: TelegramMessageKey): void;
    deleteMessageKeys(lobbyId: number, messageType: TelegramMessageType): void;
    deleteAllMessageKeys(lobbyId: number): void;
    deleteAllMessageKeysFromChat(lobbyId: number, chatId: number): void;

    getMemberByTelegramUserId(telegramUserId: number): MemberDto;
    createMember(member: MemberDto): MemberDto;
    deleteMemberByMemberId(memberId: number): void;
    deleteMemberByTelegramUserId(telegramUserId: number): void;
}
