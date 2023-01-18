import { CardCode } from "../enum";

export default interface MemberCardXrefDAO {
    getByMemberId: (memberId: number) => CardCode;
    getByMemberIds: (memberIds: number[]) => [ number, CardCode ][];
    put: (memberId: number, cardCode: CardCode) => void;
    removeByMemberId: (memberId: number) => void;
    removeByMemberIds: (memberIds: number[]) => void;
}