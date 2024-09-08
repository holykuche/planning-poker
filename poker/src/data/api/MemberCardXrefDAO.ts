import {MemberCardXref} from '../entity';
import {CardCode} from '../enum';

export default interface MemberCardXrefDAO {
  getCardByMemberId(memberId: number): Promise<CardCode>;

  getCardsByMemberIds(memberIds: number[]): Promise<MemberCardXref[]>;

  put(memberId: number, cardCode: CardCode): Promise<MemberCardXref>;

  removeByMemberId(memberId: number): Promise<void>;

  removeByMemberIds(memberIds: number[]): Promise<void>;
}
