import {Lobby} from '@/data/entity';

import ErrorType from './ErrorType';
import ServiceError from './ServiceError';

export default class PokerIsAlreadyStartedError extends ServiceError {
  readonly lobbyName: string;
  readonly currentTheme: string;

  constructor(lobby: Lobby) {
    super(
      ErrorType.PokerIsAlreadyStarted,
      `Poker in lobby '${lobby.name}' is already started with theme '${lobby.currentTheme}'.`
    );
    this.lobbyName = lobby.name;
    this.currentTheme = lobby.currentTheme;
    Object.setPrototypeOf(this, PokerIsAlreadyStartedError.prototype);
  }
}
