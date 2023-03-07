import CardDto from "./CardDto";
import TelegramMemberDto from "../../telegram-service/dto/TelegramMemberDto";

export default interface PokerResultItemDto {
    member: TelegramMemberDto,
    card: CardDto,
}