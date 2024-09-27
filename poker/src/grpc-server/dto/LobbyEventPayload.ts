import Member from './Member';
import PokerResult from './PokerResult';

export default interface LobbyEventPayload {
  members?: Member[];
  theme?: string;
  result?: PokerResult[];
}
