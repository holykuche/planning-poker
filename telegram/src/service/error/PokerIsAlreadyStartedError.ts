import {Lobby} from '@/grpc-client/entity';

import ServiceError from './ServiceError';
import ServiceErrorType from './ServiceErrorType';

export default class PokerIsAlreadyStartedError extends ServiceError {
  readonly lobbyName: string;
  readonly currentTheme: string;

  constructor(lobby: Lobby) {
    super(
      ServiceErrorType.PokerIsAlreadyStarted,
      `Poker in lobby '${lobby.name}' is already started with theme '${lobby.current_theme}'.`
    );
    this.lobbyName = lobby.name;
    this.currentTheme = lobby.current_theme!;
    Object.setPrototypeOf(this, PokerIsAlreadyStartedError.prototype);
  }
}
