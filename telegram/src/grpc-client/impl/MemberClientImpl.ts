import {injectable} from 'inversify';

import {MemberClient} from '../api';
import {BoolResponse, NumberResponse} from '../dto';
import {Member} from '../entity';
import {CardCode} from '../enum';

import AbstractPokerClientImpl from './AbstractPokerClientImpl';

@injectable()
export default class MemberClientImpl
  extends AbstractPokerClientImpl
  implements MemberClient
{
  constructor() {
    super('MemberService');
  }

  getById(member_id: number): Promise<Member> {
    return super.promiseFactory('GetById', {member_id});
  }

  getMembersLobbyId(member_id: number): Promise<number> {
    return super
      .promiseFactory<NumberResponse>('GetMembersLobbyId', {member_id})
      .then(response => response.result);
  }

  isMemberInLobby(member_id: number): Promise<boolean> {
    return super
      .promiseFactory<BoolResponse>('IsMemberInLobby', {member_id})
      .then(response => response.result);
  }

  putCard(member_id: number, card_code: CardCode): Promise<void> {
    return super.promiseFactory('PutCard', {member_id, card_code});
  }

  removeCard(member_id: number): Promise<void> {
    return super.promiseFactory('RemoveCard', {member_id});
  }

  save(member: Member): Promise<Member> {
    return super.promiseFactory('Save', member);
  }

  deleteById(member_id: number): Promise<void> {
    return super.promiseFactory('DeleteById', {member_id});
  }
}
