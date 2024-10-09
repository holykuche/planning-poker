import {injectable} from 'inversify';

import {MemberCardXrefDAO} from '../api';
import {MemberCardXref} from '../entity';
import {CardCode, TableName} from '../enum';

import AbstractDAOImpl from './AbstractDAOImpl';

@injectable()
export default class MemberCardXrefDAOImpl
  extends AbstractDAOImpl<MemberCardXref>
  implements MemberCardXrefDAO
{
  constructor() {
    super(TableName.MemberCardXref);
  }

  getCardByMemberId(member_id: number): Promise<CardCode> {
    return this.find('member_id', member_id).then(
      xref => xref?.card_code || null
    );
  }

  getCardsByMemberIds(member_ids: number[]): Promise<MemberCardXref[]> {
    return Promise.all(member_ids.map(mId => this.find('member_id', mId))).then(
      xrefs => xrefs.filter(xref => !!xref)
    );
  }

  put(member_id: number, card_code: CardCode): Promise<MemberCardXref> {
    return this.save({member_id, card_code});
  }

  removeByMemberId(member_id: number): Promise<void> {
    return this.delete('member_id', member_id);
  }

  async removeByMemberIds(member_ids: number[]): Promise<void> {
    await Promise.all(
      member_ids.map(member_id => this.removeByMemberId(member_id))
    );
  }
}
