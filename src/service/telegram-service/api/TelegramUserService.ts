import { TelegramMemberDto } from "../dto";

export default interface TelegramUserService {
    getMemberByTelegramUserId(telegramUserId: number): TelegramMemberDto;

    createMember(member: TelegramMemberDto): TelegramMemberDto;

    isMemberExists(telegramUserId: number): boolean;

    deleteMemberByMemberId(memberId: number): void;

    deleteMemberByTelegramUserId(telegramUserId: number): void;
}