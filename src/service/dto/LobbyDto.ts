import { Lobby, Member } from "data/entity";
import { CardCode } from "data/enum";
import CardDto from "./CardDto";

export default interface LobbyDto extends Lobby {
    members: Member[];
    cards: Map<number, CardDto<CardCode>>;
}