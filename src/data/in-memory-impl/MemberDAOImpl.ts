import { injectable } from "inversify";

import { MemberDAO } from "../api";
import { Member } from "../entity";

@injectable()
export default class MemberDAOImpl implements MemberDAO {

    private NEXT_MEMBER_ID = 1;
    private MEMBERS_BY_ID = new Map<number, Member>();
    private MEMBERS_BY_TELEGRAM_USER_ID = new Map<number, Member>();
    private MEMBERS_BY_NAME = new Map<string, Member>();

    getById(id: number): Member {
        const member = this.MEMBERS_BY_ID.get(id);
        return member && { ...member };
    }

    getByIds(ids: number[]): Member[] {
        return ids
            .filter(id => this.MEMBERS_BY_ID.has(id))
            .map(id => ({ ...this.MEMBERS_BY_ID.get(id) }));
    }

    getByTelegramUserId(telegramUserId: number): Member {
        const lobby = this.MEMBERS_BY_TELEGRAM_USER_ID.get(telegramUserId);
        return lobby && { ...lobby };
    }

    getByName(name: string): Member {
        const lobby = this.MEMBERS_BY_NAME.get(name);
        return lobby && { ...lobby };
    }

    save(member: Member): Member {
        const storedMember = { ...member, id: member.id || this.NEXT_MEMBER_ID++ };
        this.MEMBERS_BY_ID.set(storedMember.id, storedMember);
        this.MEMBERS_BY_NAME.set(storedMember.name, storedMember);
        if (storedMember.telegramUserId) {
            this.MEMBERS_BY_TELEGRAM_USER_ID.set(storedMember.telegramUserId, storedMember);
        }
        return { ...storedMember };
    }

    delete(id: number): void {
        const member = this.MEMBERS_BY_ID.get(id);
        this.MEMBERS_BY_ID.delete(id);
        this.MEMBERS_BY_NAME.delete(member?.name);
        this.MEMBERS_BY_TELEGRAM_USER_ID.delete(member?.telegramUserId);
    }
    
}
