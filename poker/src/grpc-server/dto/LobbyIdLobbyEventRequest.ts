import LobbyEvent from './LobbyEvent';

export default interface LobbyIdLobbyEventRequest {
  lobby_id: number;
  event: LobbyEvent;
}
