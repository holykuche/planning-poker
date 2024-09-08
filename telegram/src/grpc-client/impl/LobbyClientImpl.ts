import {injectable} from 'inversify';

import {LobbyClient} from '../api';
import {Lobby} from '../entity';

import AbstractPokerClientImpl from './AbstractPokerClientImpl';

@injectable()
export default class LobbyClientImpl
  extends AbstractPokerClientImpl
  implements LobbyClient
{
  constructor() {
    super('LobbyService');
  }

  getById(lobby_id: number): Promise<Lobby> {
    return super.promiseFactory('GetById', {lobby_id});
  }

  getByName(lobby_name: string): Promise<Lobby> {
    return super.promiseFactory('GetByName', {lobby_name});
  }

  createLobby(lobby_name: string): Promise<Lobby> {
    return super.promiseFactory('CreateLobby', {lobby_name});
  }

  getMembersLobby(member_id: number): Promise<Lobby> {
    return super.promiseFactory('GetMembersLobby', {member_id});
  }

  enterMember(member_id: number, lobby_id: number): Promise<void> {
    return super.promiseFactory('EnterMember', {member_id, lobby_id});
  }

  leaveMember(member_id: number, lobby_id: number): Promise<void> {
    return super.promiseFactory('LeaveMember', {member_id, lobby_id});
  }

  startPoker(lobby_id: number, theme: string): Promise<void> {
    return super.promiseFactory('StartPoker', {lobby_id, theme});
  }

  cancelPoker(lobby_id: number): Promise<void> {
    return super.promiseFactory('CancelPoker', {lobby_id});
  }
}
