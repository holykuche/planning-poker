import ServiceError from './ServiceError';
import ServiceErrorType from './ServiceErrorType';

export default class MemberIsAlreadyInLobbyError extends ServiceError {
  readonly memberName: string;

  constructor(memberName: string) {
    super(
      ServiceErrorType.MemberIsAlreadyInLobby,
      `User '${memberName}' is already included into lobby.`
    );
    this.memberName = memberName;
    Object.setPrototypeOf(this, MemberIsAlreadyInLobbyError.prototype);
  }
}
