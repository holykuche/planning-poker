import { Member } from "../entity";

export default interface MemberDAO {

    getById(id: number): Member;

    getByIds(ids: number[]): Member[];

    getByName(name: string): Member;

    save(member: Member): Member;

    deleteById(id: number): void;

    deleteByIds(ids: number[]): void;

}
