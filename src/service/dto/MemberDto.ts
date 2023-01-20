import { Member } from "data/entity";

export default interface MemberDto extends Member {
    telegramUserId?: number;
}
