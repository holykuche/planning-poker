import { Member } from "data/common-data/entity";

export default interface TelegramMemberDto extends Member {
    telegramUserId?: number;
}
