import { inject, injectable } from "inversify";

import { DAO_TYPES, TelegramUserDAO } from "data/api";

import { MemberService, SERVICE_TYPES, TelegramUserService } from "../api";
import { TelegramMemberDto } from "../dto";
import { MemberIsAlreadyInLobbyError, UnknownMemberError } from "../error";

@injectable()
export default class TelegramUserServiceImpl implements TelegramUserService {

    @inject(DAO_TYPES.TelegramUserDAO) private readonly telegramUserDAO: TelegramUserDAO;
    @inject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;

    getMemberByTelegramUserId(telegramUserId: number): Promise<TelegramMemberDto> {
        return this.telegramUserDAO.getMemberIdByTelegramUserId(telegramUserId)
            .then(memberId => {
                if (!memberId) {
                    throw new UnknownMemberError();
                }

                return this.memberService.getById(memberId);
            })
            .then(member => {
                if (!member) {
                    throw new UnknownMemberError();
                }

                return { ...member, telegramUserId };
            });
    }

    createMember(member: TelegramMemberDto): Promise<TelegramMemberDto> {
        return this.telegramUserDAO.getMemberIdByTelegramUserId(member.telegramUserId)
            .then(async existedMemberId => {
                if (existedMemberId) {
                    const existedMember = await this.memberService.getById(existedMemberId);
                    throw new MemberIsAlreadyInLobbyError(existedMember.name);
                }
            })
            .then(() => this.memberService.save(member))
            .then(storedMember => ({ ...storedMember, telegramUserId: member.telegramUserId }))
            .then(
                storedMember =>
                    this.telegramUserDAO.bindTelegramUserWithMember(storedMember.telegramUserId, storedMember.id)
                        .then(() => storedMember)
            );
    }

    isMemberExists(telegramUserId: number): Promise<boolean> {
        return this.telegramUserDAO.isMemberExists(telegramUserId);
    }

    deleteMemberByMemberId(memberId: number): Promise<void> {
        return this.telegramUserDAO.unbindMemberFromTelegramUser(memberId)
            .then(() => this.memberService.deleteById(memberId));
    }

    deleteMemberByTelegramUserId(telegramUserId: number): Promise<void> {
        return this.telegramUserDAO.getMemberIdByTelegramUserId(telegramUserId)
            .then(memberId => this.memberService.deleteById(memberId))
            .then(() => this.telegramUserDAO.unbindTelegramUserFromMember(telegramUserId));
    }
}