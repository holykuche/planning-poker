import ServiceError from './ServiceError';
import ServiceErrorType from './ServiceErrorType';

export default class UnknownMemberError extends ServiceError {
  constructor() {
    super(ServiceErrorType.UnknownMember, 'Unknown member.');
    Object.setPrototypeOf(this, UnknownMemberError.prototype);
  }
}
