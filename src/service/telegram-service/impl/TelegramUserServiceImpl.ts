import { inject, injectable } from "inversify";

import { MemberIsAlreadyInLobbyError, UnknownMemberError } from "service/common-service/error";
import { TELEGRAM_DAO_TYPES, TelegramUserDAO } from "data/telegram-data/api";
import { COMMON_DAO_TYPES, MemberDAO } from "data/common-data/api";

import { TelegramUserService } from "../api";
import { TelegramMemberDto } from "../dto";

@injectable()
export default class TelegramUserServiceImpl implements TelegramUserService {

    @inject(TELEGRAM_DAO_TYPES.TelegramUserDAO) private readonly telegramUserDAO: TelegramUserDAO;
    @inject(COMMON_DAO_TYPES.MemberDAO) private readonly memberDAO: MemberDAO;

    getMemberByTelegramUserId(telegramUserId: number): TelegramMemberDto {
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

    createMember(member: TelegramMemberDto): TelegramMemberDto {
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