import CardDto from "./CardDto";
import MemberDto from "./MemberDto";

export default interface PokerResultItemDto {
    member: MemberDto,
    card: CardDto,
}