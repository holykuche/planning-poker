import { CardCode } from "../enum";

export default interface MemberIdCardCodeRequest {
    member_id: number;
    card_code: CardCode;
}