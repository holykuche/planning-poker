import ErrorType from './ErrorType';
import ServiceError from './ServiceError';

export default class UnknownMemberError extends ServiceError {
  constructor() {
    super(ErrorType.UnknownMember, 'Unknown member.');
    Object.setPrototypeOf(this, UnknownMemberError.prototype);
  }
}
