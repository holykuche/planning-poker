import { Member } from "data/entity";
import { CardCode } from "data/enum";

export default interface MemberService {
    getById: (memberId: number) => Member;
    getByTelegramUserId: (telegramUserId: number) => Member;
    getMembersLobbyId: (memberId: number) => number;
    putCard: (memberId: number, cardCode: CardCode) => void;
    removeCard: (memberId: number) => void;
}