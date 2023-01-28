import { injectable } from "inversify";

import { Lobby } from "../entity";
import { LobbyDAO } from "../api"

@injectable()
export default class LobbyDAOImpl implements LobbyDAO {

    private nextLobbyId = 1;
    private lobbiesById = new Map<number, Lobby>();
    private lobbiesByName = new Map<string, Lobby>();

    getById(id: number): Lobby {
        const lobby = this.lobbiesById.get(id);
        return lobby && { ...lobby };
    }

    getByName(name: string): Lobby {
        const lobby = this.lobbiesByName.get(name);
        return lobby && { ...lobby };
    }

    save(lobby: Lobby): Lobby {
        const storedLobby = { ...lobby, id: lobby.id || this.nextLobbyId++ };
        this.lobbiesById.set(storedLobby.id, storedLobby);
        this.lobbiesByName.set(storedLobby.name, storedLobby);
        return { ...storedLobby };
    }

    delete(id: number): void {
        const lobby = this.lobbiesById.get(id);
        this.lobbiesById.delete(id);
        this.lobbiesByName.delete(lobby.name);
    }

    isExists(name: string): boolean {
        return this.lobbiesByName.has(name);
    }

}
