import { Lobby } from "../entity";

export default interface LobbyDAO {
    getById: (id: number) => Lobby;
    getByName: (name: string) => Lobby;
    save: (lobby: Lobby) => Lobby;
    delete: (id: number) => void;
    isExists: (name: string) => boolean;
}
