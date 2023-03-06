import { inject, injectable } from "inversify";

import { TELEGRAM_DAO_TYPES, TelegramMessageDAO, TelegramUserDAO } from "data/telegram-data/api";
import { TelegramMessage } from "data/telegram-data/entity";
import { TelegramMessageType } from "data/telegram-data/enum";

import { COMMON_DAO_TYPES, LobbyDAO, MemberDAO } from "data/common-data/api";
import { UnknownMemberError, MemberIsAlreadyInLobbyError } from "service/common-service/error";

import { TelegramDataService } from "../api";
import { MemberDto } from "../dto";

@injectable()
export default class TelegramDataServiceImpl implements TelegramDataService {

    @inject(TELEGRAM_DAO_TYPES.TelegramMessageDAO) private readonly telegramMessageDAO: TelegramMessageDAO;
    @inject(TELEGRAM_DAO_TYPES.TelegramUserDAO) private readonly telegramUserDAO: TelegramUserDAO;
    @inject(COMMON_DAO_TYPES.LobbyDAO) private readonly lobbyDAO: LobbyDAO;
    @inject(COMMON_DAO_TYPES.MemberDAO) private readonly memberDAO: MemberDAO;

    getMessage(lobbyId: number, chatId: number, messageType: TelegramMessageType): TelegramMessage {
        return this.telegramMessageDAO.getMessage(lobbyId, chatId, messageType);
    }

    getMessages(lobbyId: number, messageType: TelegramMessageType): TelegramMessage[] {
        return this.telegramMessageDAO.getAllMessages(lobbyId)
            .filter(msg => msg.messageType === messageType);
    }

    addMessage(message: TelegramMessage): void {
        this.telegramMessageDAO.addMessage(message);
    }

    deleteMessageById(messageId: number): void {
        this.telegramMessageDAO.deleteMessageById(messageId);
    }

    deleteMessages(lobbyId: number, messageType: TelegramMessageType): void {
        this.telegramMessageDAO.deleteMessages(lobbyId, messageType);
    }

    deleteAllMessages(lobbyId: number): void {
        this.telegramMessageDAO.deleteAllMessages(lobbyId);
    }

    deleteAllMessagesFromChat(lobbyId: number, chatId: number): void {
        this.telegramMessageDAO.deleteAllMessagesFromChat(lobbyId, chatId);
    }

    getMemberByTelegramUserId(telegramUserId: number): MemberDto {
        const memberId = this.telegramUserDAO.getMemberIdByTelegramUserId(telegramUserId);

        if (!memberId) {
            throw new UnknownMemberError();
        }

        const member = this.memberDAO.getById(memberId);

        if (!member) {
            throw new UnknownMemberError();
        }

        return { ...member, telegramUserId };
    }

    createMember(member: MemberDto): MemberDto {
        const existedMemberId = this.telegramUserDAO.getMemberIdByTelegramUserId(member.telegramUserId);
        if (existedMemberId) {
            const existedMember = this.memberDAO.getById(existedMemberId);
            throw new MemberIsAlreadyInLobbyError(existedMember.name);
        }

        const storedMember = { ...this.memberDAO.save(member), telegramUserId: member.telegramUserId };
        this.telegramUserDAO.bindTelegramUserWithMember(storedMember.telegramUserId, storedMember.id);

        return storedMember;
    }

    isMemberExists(telegramUserId: number): boolean {
        return this.telegramUserDAO.isMemberExists(telegramUserId);
    }

    deleteMemberByMemberId(memberId: number): void {
        this.telegramUserDAO.unbindMemberFromTelegramUser(memberId);
        this.memberDAO.deleteById(memberId);
    }

    deleteMemberByTelegramUserId(telegramUserId: number): void {
        const memberId = this.telegramUserDAO.getMemberIdByTelegramUserId(telegramUserId);
        this.telegramUserDAO.unbindTelegramUserFromMember(telegramUserId);
        this.memberDAO.deleteById(memberId);
    }

}