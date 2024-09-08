import {
  ServiceError,
  LobbyAlreadyExistsError,
  PokerIsAlreadyStartedError,
  UnknownMemberError,
  MemberIsAlreadyInLobbyError,
  MemberIsNotInLobbyError,
  PokerIsNotStartedError,
} from '@/service/error';

export default function (error: ServiceError) {
  switch (error.constructor) {
    case LobbyAlreadyExistsError:
    case PokerIsAlreadyStartedError:
    case PokerIsNotStartedError:
      return error.message;
    case UnknownMemberError:
      return 'You are not a member of any lobby.\nType /help for get the help message.';
    case MemberIsAlreadyInLobbyError:
      return 'You are already a member of a lobby.';
    case MemberIsNotInLobbyError:
      return 'You are not included into any lobby.';
    default:
      throw Error(`Unhandled error ${error.name}`);
  }
}
