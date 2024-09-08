import ErrorType from './ErrorType';
import ServiceError from './ServiceError';

export default class LobbyAlreadyExistsError extends ServiceError {
  readonly lobbyName: string;

  constructor(lobbyName: string) {
    super(
      ErrorType.LobbyAlreadyExists,
      `Lobby with name '${lobbyName}' already exists`
    );
    this.lobbyName = lobbyName;
    Object.setPrototypeOf(this, LobbyAlreadyExistsError.prototype);
  }
}
