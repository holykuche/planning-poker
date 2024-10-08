import ServiceError from './ServiceError';
import ServiceErrorType from './ServiceErrorType';

export default class LobbyAlreadyExistsError extends ServiceError {
  readonly lobbyName: string;

  constructor(lobbyName: string) {
    super(
      ServiceErrorType.LobbyAlreadyExists,
      `Lobby with name '${lobbyName}' already exists`
    );
    this.lobbyName = lobbyName;
    Object.setPrototypeOf(this, LobbyAlreadyExistsError.prototype);
  }
}
