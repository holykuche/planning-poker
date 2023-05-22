import { TelegramMemberDto } from "../dto";

export default interface TelegramUserService {

    getMemberByTelegramUserId(telegramUserId: number): Promise<TelegramMemberDto>;

    createMember(member: TelegramMemberDto): Promise<TelegramMemberDto>;

    isMemberExists(telegramUserId: number): Promise<boolean>;

    deleteMemberByMemberId(memberId: number): Promise<void>;

    deleteMemberByTelegramUserId(telegramUserId: number): Promise<void>;

}