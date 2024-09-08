import {LobbyState} from '@/grpc-client/enum';

export default interface Lobby {
  id?: number;
  name: string;
  currentTheme?: string;
  state: LobbyState;
}
