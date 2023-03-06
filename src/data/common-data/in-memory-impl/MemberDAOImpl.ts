import { injectable } from "inversify";

import { AbstractInMemoryDAOImpl } from "data/base-data/in-memory-impl";

import { MemberDAO } from "../api";
import { Member } from "../entity";

@injectable()
export default class MemberDAOImpl extends AbstractInMemoryDAOImpl<Member, "id"> implements MemberDAO {

    constructor() {
        super({
            indexBy: [ "name" ],
            primaryKey: "id",
            initialPrimaryKeyValue: 1,
            getNextPrimaryKeyValue: current => current + 1,
        });
    }

    getById(id: number): Member {
        return this.find("id", id);
    }

    getByIds(ids: number[]): Member[] {
        return ids
            .map(id => this.getById(id))
            .filter(m => !!m);
    }

    getByName(name: string): Member {
        return this.find("name", name);
    }

    deleteById(id: number): void {
        this.delete("id", id);
    }

    deleteByIds(ids: number[]): void {
        ids.forEach(id => this.deleteById(id));
    }

}
