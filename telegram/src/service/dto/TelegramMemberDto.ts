import { Member } from "data/entity";

export default interface TelegramMemberDto extends Member {
    telegramUserId?: number;
}