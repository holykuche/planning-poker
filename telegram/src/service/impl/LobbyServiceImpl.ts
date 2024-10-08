import {inject, injectable} from 'inversify';

import {GRPC_CLIENT_TYPES, LobbyClient} from '@/grpc-client/api';
import {Lobby as ProtobufLobby} from '@/grpc-client/entity';

import {LobbyService} from '../api';
import {Lobby} from '../entity';

import AbstractServiceImpl from './AbstractServiceImpl';

@injectable()
export default class LobbyServiceImpl
  extends AbstractServiceImpl
  implements LobbyService
{
  @inject(GRPC_CLIENT_TYPES.LobbyClient)
  private readonly lobbyClient: LobbyClient;

  getById(id: number): Promise<Lobby> {
    return this.lobbyClient
      .getById(id)
      .then(LobbyServiceImpl.deserializeLobby)
      .catch(LobbyServiceImpl.handleGrpcError);
  }

  getByName(name: string): Promise<Lobby> {
    return this.lobbyClient
      .getByName(name)
      .then(LobbyServiceImpl.deserializeLobby)
      .catch(LobbyServiceImpl.handleGrpcError);
  }

  createLobby(lobbyName: string): Promise<Lobby> {
    return this.lobbyClient
      .createLobby(lobbyName)
      .then(LobbyServiceImpl.deserializeLobby)
      .catch(LobbyServiceImpl.handleGrpcError);
  }

  getMembersLobby(memberId: number): Promise<Lobby> {
    return this.lobbyClient
      .getMembersLobby(memberId)
      .then(LobbyServiceImpl.deserializeLobby)
      .catch(LobbyServiceImpl.handleGrpcError);
  }

  enterMember(memberId: number, lobbyId: number): Promise<void> {
    return this.lobbyClient
      .enterMember(memberId, lobbyId)
      .catch(LobbyServiceImpl.handleGrpcError);
  }

  leaveMember(memberId: number, lobbyId: number): Promise<void> {
    return this.lobbyClient
      .leaveMember(memberId, lobbyId)
      .catch(LobbyServiceImpl.handleGrpcError);
  }

  startPoker(lobbyId: number, theme: string): Promise<void> {
    return this.lobbyClient
      .startPoker(lobbyId, theme)
      .catch(LobbyServiceImpl.handleGrpcError);
  }

  cancelPoker(lobbyId: number): Promise<void> {
    return this.lobbyClient
      .cancelPoker(lobbyId)
      .catch(LobbyServiceImpl.handleGrpcError);
  }

  private static deserializeLobby(lobby: ProtobufLobby): Lobby {
    return {
      id: lobby.id,
      name: lobby.name,
      currentTheme: lobby.current_theme,
      state: lobby.state,
    };
  }
}
