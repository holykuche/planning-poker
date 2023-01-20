import { inject, injectable } from "inversify";

import { TelegramMessageKey } from "data/entity";
import { DAO_TYPES, LobbyDAO, TelegramDataDAO, MemberDAO } from "data/api";

import { TelegramDataService } from "../api";
import { MessageDoesNotExistError, UnknownMemberError } from "../error";
import { MemberDto } from "../dto";

@injectable()
export default class TelegramDataServiceImpl implements TelegramDataService {

    @inject(DAO_TYPES.TelegramDataDAO) private readonly telegramDataDAO: TelegramDataDAO;
    @inject(DAO_TYPES.LobbyDAO) private readonly lobbyDAO: LobbyDAO;
    @inject(DAO_TYPES.MemberDAO) private readonly memberDAO: MemberDAO;

    getMembersMessageId(lobbyId: number, chatId: number): number {
        const messageKey = this.telegramDataDAO.getMembersMessageKeys(lobbyId)
            .find(key => key.chatId === chatId);

        if (!messageKey) {
            const lobby = this.lobbyDAO.getById(lobbyId);
            throw new MessageDoesNotExistError("Members", lobby, chatId);
        }

        return messageKey.messageId;
    }

    addMembersMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        this.telegramDataDAO.addMembersMessageKey(lobbyId, messageKey);
    }

    deleteMembersMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        this.telegramDataDAO.deleteMembersMessageKey(lobbyId, messageKey);
    }

    deleteAllMembersMessageKeys(lobbyId: number): void {
        this.telegramDataDAO.deleteAllMembersMessageKeys(lobbyId);
    }

    getResultMessageId(lobbyId: number, chatId: number): number {
        const messageKey = this.telegramDataDAO.getResultMessageKeys(lobbyId)
            .find(key => key.chatId === chatId);

        if (!messageKey) {
            const lobby = this.lobbyDAO.getById(lobbyId);
            throw new MessageDoesNotExistError("Result", lobby, chatId);
        }

        return messageKey.messageId;
    }

    addResultMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        this.telegramDataDAO.addResultMessageKey(lobbyId, messageKey);
    }

    deleteResultMessageKey(lobbyId: number, messageKey: TelegramMessageKey): void {
        this.telegramDataDAO.deleteResultMessageKey(lobbyId, messageKey);
    }

    deleteAllResultMessageKeys(lobbyId: number): void {
        this.telegramDataDAO.deleteAllResultMessageKeys(lobbyId);
    }

    getMemberByTelegramUserId(telegramUserId: number): MemberDto {
        const memberId = this.telegramDataDAO.getMemberIdByTelegramUserId(telegramUserId);

        if (!memberId) {
            throw new UnknownMemberError();
        }

        const member = this.memberDAO.getById(memberId);

        if (!member) {
            throw new UnknownMemberError();
        }

        return { ...member, telegramUserId };
    }

    saveMember(member: MemberDto): MemberDto {
        const storedMember = { ...this.memberDAO.save(member), telegramUserId: member.telegramUserId };
        this.telegramDataDAO.bindTelegramUserWithMember(storedMember.telegramUserId, storedMember.id);

        return storedMember;
    }

    deleteMemberByMemberId(memberId: number): void {
        this.telegramDataDAO.unbindMemberFromTelegramUser(memberId);
        this.memberDAO.deleteById(memberId);
    }

    deleteMemberByTelegramUserId(telegramUserId: number): void {
        const memberId = this.telegramDataDAO.getMemberIdByTelegramUserId(telegramUserId);
        this.telegramDataDAO.unbindTelegramUserFromMember(telegramUserId);
        this.memberDAO.deleteById(memberId);
    }

}