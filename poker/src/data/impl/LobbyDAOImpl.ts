import { injectable } from "inversify";

import { Lobby } from "../entity";
import { LobbyDAO } from "../api"

@injectable()
export default class LobbyDAOImpl implements LobbyDAO {

    private readonly TABLE_NAME = "lobby";

    constructor() {
        super({
            indexBy: [ "name" ],
            primaryKey: "id",
            initialPrimaryKeyValue: 1,
            getNextPrimaryKeyValue: current => current + 1,
        });
    }

    getById(id: number): Lobby {
        return this.find("id", id);
    }

    getByName(name: string): Lobby {
        return this.find("name", name);
    }

    save(lobby: Lobby): Lobby {
        return undefined;
    }

    deleteById(id: number): void {
        this.delete("id", id);
    }

    isExists(name: string): boolean {
        return !!this.getByName(name);
    }

}
