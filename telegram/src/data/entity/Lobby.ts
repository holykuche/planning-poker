import { LobbyState } from "../enum";

export default interface Lobby {
    id?: number;
    name: string;
    currentTheme?: string;
    state: LobbyState;
}