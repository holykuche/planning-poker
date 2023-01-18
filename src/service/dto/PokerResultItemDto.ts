import { Member } from "data/entity";
import CardDto from "./CardDto";

export default interface PokerResultItemDto {
    member: Member,
    card: CardDto,
}