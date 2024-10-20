import {Lobby} from '@/grpc-client/entity';

import ServiceError from './ServiceError';
import ServiceErrorType from './ServiceErrorType';

export default class PokerIsNotStartedError extends ServiceError {
  readonly lobbyName: string;

  constructor(lobby: Lobby) {
    super(
      ServiceErrorType.PokerIsNotStarted,
      `Poker in lobby '${lobby.name}' is not started.`
    );
    this.lobbyName = lobby.name;
    Object.setPrototypeOf(this, PokerIsNotStartedError.prototype);
  }
}
