import { inject, injectable } from "inversify";

import { TelegramMessageKey } from "data/entity";
import { DAO_TYPES, LobbyDAO, TelegramMessageDAO, MemberDAO, TelegramUserDAO } from "data/api";
import { TelegramMessageType } from "data/enum";

import { TelegramDataService } from "../api";
import { UnknownMemberError, MemberIsAlreadyInLobbyError } from "../error";
import { MemberDto } from "../dto";

@injectable()
export default class TelegramDataServiceImpl implements TelegramDataService {

    @inject(DAO_TYPES.TelegramMessageDAO) private readonly telegramMessageDAO: TelegramMessageDAO;
    @inject(DAO_TYPES.TelegramUserDAO) private readonly telegramUserDAO: TelegramUserDAO;
    @inject(DAO_TYPES.LobbyDAO) private readonly lobbyDAO: LobbyDAO;
    @inject(DAO_TYPES.MemberDAO) private readonly memberDAO: MemberDAO;

    getMessageId(lobbyId: number, chatId: number, messageType: TelegramMessageType): number {
        return this.telegramMessageDAO.getMessageKeys(lobbyId, messageType)
            .find(key => key.chatId === chatId)
            ?.messageId;
    }

    addMessageKey(lobbyId: number, messageType: TelegramMessageType, messageKey: TelegramMessageKey): void {
        this.telegramMessageDAO.addMessageKey(lobbyId, messageType, messageKey);
    }

    deleteMessageKey(lobbyId: number, messageType: TelegramMessageType, messageKey: TelegramMessageKey): void {
        this.telegramMessageDAO.deleteMessageKey(lobbyId, messageType, messageKey);
    }

    deleteMessageKeys(lobbyId: number, messageType: TelegramMessageType): void {
        this.telegramMessageDAO.deleteMessageKeys(lobbyId, messageType);
    }

    deleteAllMessageKeys(lobbyId: number): void {
        this.telegramMessageDAO.deleteAllMessageKeys(lobbyId);
    }

    deleteAllMessageKeysFromChat(lobbyId: number, chatId: number): void {
        this.telegramMessageDAO.deleteAllMessageKeysFromChat(lobbyId, chatId);
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

    isMemberExisted(telegramUserId: number): boolean {
        return this.telegramUserDAO.isMemberExisted(telegramUserId);
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