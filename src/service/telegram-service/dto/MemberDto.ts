import { Member } from "data/common-data/entity";

export default interface MemberDto extends Member {
    telegramUserId?: number;
}
