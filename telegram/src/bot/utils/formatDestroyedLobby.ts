import escape from './escape';
import italic from './italic';

export default function (lobbyName: string): string {
  return `Lobby '${italic(escape(lobbyName))}' was destroyed due to no activity`;
}
