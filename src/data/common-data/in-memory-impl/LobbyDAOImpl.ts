import { injectable } from "inversify";

import { AbstractInMemoryDAOImpl } from "data/base-data/in-memory-impl";

import { Lobby } from "../entity";
import { LobbyDAO } from "../api"

@injectable()
export default class LobbyDAOImpl extends AbstractInMemoryDAOImpl<Lobby, "id"> implements LobbyDAO {

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

    deleteById(id: number): void {
        this.delete("id", id);
    }

    isExists(name: string): boolean {
        return !!this.getByName(name);
    }

}
