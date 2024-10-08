import ServiceError from './ServiceError';
import ServiceErrorType from './ServiceErrorType';

export default class MemberIsNotInLobbyError extends ServiceError {
  readonly memberName: string;

  constructor(memberName: string) {
    super(
      ServiceErrorType.MemberIsNotInLobby,
      `User '${memberName}' is not included into any lobby.`
    );
    this.memberName = memberName;
    Object.setPrototypeOf(this, MemberIsNotInLobbyError.prototype);
  }
}
