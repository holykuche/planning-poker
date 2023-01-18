import { Member } from "../entity";

export default interface MemberDAO {
    getById: (id: number) => Member;
    getByIds: (ids: number[]) => Member[];
    getByTelegramUserId: (telegramUserId: number) => Member;
    getByName: (name: string) => Member;
    save: (member: Member) => Member;
    delete: (id: number) => void;
}
