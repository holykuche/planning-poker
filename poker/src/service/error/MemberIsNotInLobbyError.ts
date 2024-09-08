import ErrorType from './ErrorType';
import ServiceError from './ServiceError';

export default class MemberIsNotInLobbyError extends ServiceError {
  readonly memberName: string;

  constructor(memberName: string) {
    super(
      ErrorType.MemberIsNotInLobby,
      `User '${memberName}' is not included into any lobby.`
    );
    this.memberName = memberName;
    Object.setPrototypeOf(this, MemberIsNotInLobbyError.prototype);
  }
}
