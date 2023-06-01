import { Member } from "grpc-client/entity";
import CardDto from "./CardDto";

export default interface PokerResultItemDto {
    member: Member,
    card: CardDto,
}