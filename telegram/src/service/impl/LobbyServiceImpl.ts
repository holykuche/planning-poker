import {inject, injectable} from 'inversify';

import {GRPC_CLIENT_TYPES, LobbyClient} from '@/grpc-client/api';
import {Lobby} from '@/grpc-client/entity';

import {LobbyService} from '../api';

@injectable()
export default class LobbyServiceImpl implements LobbyService {
  @inject(GRPC_CLIENT_TYPES.LobbyClient)
  private readonly lobbyClient: LobbyClient;

  getById(id: number): Promise<Lobby> {
    return this.lobbyClient.getById(id);
  }

  getByName(name: string): Promise<Lobby> {
    return this.lobbyClient.getByName(name);
  }

  getMembersLobby(member_id: number): Promise<Lobby> {
    return this.lobbyClient.getMembersLobby(member_id);
  }

  createLobby(lobby_name: string): Promise<Lobby> {
    return this.lobbyClient.createLobby(lobby_name);
  }

  enterMember(member_id: number, lobby_id: number): Promise<void> {
    return this.lobbyClient.enterMember(member_id, lobby_id);
  }

  leaveMember(member_id: number, lobby_id: number): Promise<void> {
    return this.lobbyClient.leaveMember(member_id, lobby_id);
  }

  startPoker(lobby_id: number, theme: string): Promise<void> {
    return this.lobbyClient.startPoker(lobby_id, theme);
  }

  cancelPoker(lobby_id: number): Promise<void> {
    return this.lobbyClient.cancelPoker(lobby_id);
  }
}
