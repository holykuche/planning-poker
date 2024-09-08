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

  getMembersBinding(memberId: number): Promise<number> {
    return this.find('memberId', memberId).then(xref => xref?.lobbyId || null);
  }

  getMemberIdsByLobbyId(lobbyId: number): Promise<number[]> {
    return this.findMany('lobbyId', lobbyId).then(xrefs =>
      xrefs.map(xref => xref.memberId)
    );
  }

  async bindMember(memberId: number, lobbyId: number): Promise<void> {
    await this.save({memberId, lobbyId});
  }

  unbindMember(memberId: number): Promise<void> {
    return this.delete('memberId', memberId);
  }

  unbindMembers(lobbyId: number): Promise<void> {
    return this.delete('lobbyId', lobbyId);
  }

  async isMemberBound(memberId: number): Promise<boolean> {
    return !!(await this.find('memberId', memberId));
  }
}
