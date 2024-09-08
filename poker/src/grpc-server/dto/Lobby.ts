import {LobbyState} from '@/data/enum';

export default interface Lobby {
  id?: number;
  name: string;
  current_theme: string;
  state: LobbyState;
}
