import { injectable } from "inversify";

import { MemberDAO } from "../api";
import { Member } from "../entity";

@injectable()
export default class MemberDAOImpl implements MemberDAO {

    private nextMemberId = 1;
    private membersById = new Map<number, Member>();
    private membersByName = new Map<string, Member>();

    getById(id: number): Member {
        const member = this.membersById.get(id);
        return member && { ...member };
    }

    getByIds(ids: number[]): Member[] {
        return ids
            .filter(id => this.membersById.has(id))
            .map(id => ({ ...this.membersById.get(id) }));
    }

    getByName(name: string): Member {
        const lobby = this.membersByName.get(name);
        return lobby && { ...lobby };
    }

    save(member: Member): Member {
        if (member.id && this.membersById.has(member.id)) {
            const existedMember = this.membersById.get(member.id);
            this.membersByName.delete(existedMember.name);
        }

        const storedMember = { ...member, id: member.id || this.nextMemberId++ };
        this.membersById.set(storedMember.id, storedMember);
        this.membersByName.set(storedMember.name, storedMember);
        return { ...storedMember };
    }

    deleteById(id: number): void {
        const member = this.membersById.get(id);
        this.membersById.delete(id);
        this.membersByName.delete(member?.name);
    }

    deleteByIds(ids: number[]): void {
        ids.forEach(id => this.deleteById(id));
    }

}
