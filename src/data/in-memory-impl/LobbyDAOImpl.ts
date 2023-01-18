import { injectable } from "inversify";

import { Lobby } from "../entity";
import { LobbyDAO } from "../api"

@injectable()
export default class LobbyDAOImpl implements LobbyDAO {

    private NEXT_LOBBY_ID = 1;
    private LOBBIES_BY_ID = new Map<number, Lobby>();
    private LOBBIES_BY_NAME = new Map<string, Lobby>();

    getById(id: number): Lobby {
        const lobby = this.LOBBIES_BY_ID.get(id);
        return lobby && { ...lobby };
    }

    getByName(name: string): Lobby {
        const lobby = this.LOBBIES_BY_NAME.get(name);
        return lobby && { ...lobby };
    }

    save(lobby: Lobby): Lobby {
        const storedLobby = { ...lobby, id: lobby.id || this.NEXT_LOBBY_ID++ };
        this.LOBBIES_BY_ID.set(storedLobby.id, storedLobby);
        this.LOBBIES_BY_NAME.set(storedLobby.name, storedLobby);
        return { ...storedLobby };
    }

    delete(id: number): void {
        const lobby = this.LOBBIES_BY_ID.get(id);
        this.LOBBIES_BY_ID.delete(id);
        this.LOBBIES_BY_NAME.delete(lobby.name);
    }

    isExists(name: string): boolean {
        return this.LOBBIES_BY_NAME.has(name);
    }

}
