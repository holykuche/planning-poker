import { Lobby, Member } from "data/entity";
import CardDto from "./CardDto";

export default interface LobbyDto extends Lobby {
    members: Member[];
    cards: Map<number, CardDto>;
}