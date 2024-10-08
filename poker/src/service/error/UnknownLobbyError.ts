import ServiceError from './ServiceError';
import ServiceErrorType from './ServiceErrorType';

export default class UnknownLobbyError extends ServiceError {
  constructor() {
    super(ServiceErrorType.UnknownLobby, 'Unknown lobby.');
    Object.setPrototypeOf(this, UnknownLobbyError.prototype);
  }
}
