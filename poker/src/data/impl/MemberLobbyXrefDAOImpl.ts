import {injectable} from 'inversify';

import {MemberLobbyXrefDAO} from '../api';
import {MemberLobbyXref} from '../entity';
import {TableName} from '../enum';

import AbstractDAOImpl from './AbstractDAOImpl';

@injectable()
export default class MemberLobbyXrefDAOImpl
  extends AbstractDAOImpl<MemberLobbyXref>
  implements MemberLobbyXrefDAO
{
  constructor() {
    super(TableName.MemberLobbyXref);
  }

  getMembersBinding(member_id: number): Promise<number> {
    return this.find('member_id', member_id).then(
      xref => xref?.lobby_id || null
    );
  }

  async getMemberIdsByLobbyId(lobby_id: number): Promise<number[]> {
    const xrefs = await this.findMany('lobby_id', lobby_id);
    return xrefs.map(xref => xref.member_id);
  }

  async bindMember(member_id: number, lobby_id: number): Promise<void> {
    await this.save({member_id, lobby_id});
  }

  unbindMember(member_id: number): Promise<void> {
    return this.delete('member_id', member_id);
  }

  unbindMembers(lobby_id: number): Promise<void> {
    return this.delete('lobby_id', lobby_id);
  }

  async isMemberBound(member_id: number): Promise<boolean> {
    return !!(await this.find('member_id', member_id));
  }
}
