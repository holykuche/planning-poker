import CardDto from "./CardDto";
import MemberDto from "../../telegram-service/dto/MemberDto";

export default interface PokerResultItemDto {
    member: MemberDto,
    card: CardDto,
}