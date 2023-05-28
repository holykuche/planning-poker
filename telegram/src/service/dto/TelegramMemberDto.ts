import { Member } from "grpc-client/entity";

export default interface TelegramMemberDto extends Member {
    telegramUserId?: number;
}