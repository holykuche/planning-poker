import { container } from "./inversify";
import { DbController, CONTROLLER_TYPES } from "../controller/api";

export enum TableName {
    Lobby = "lobby",
    Member = "member",
    MemberCardXref = "member_card_xref",
    MemberLobbyXref = "member_lobby_xref",
}
