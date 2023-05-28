import { LobbyState } from "../enum";

export default interface Lobby {
    id?: number;
    name: string;
    current_theme?: string;
    state: LobbyState
}