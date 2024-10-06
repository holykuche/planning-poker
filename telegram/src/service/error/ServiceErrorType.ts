enum ServiceErrorType {
  LobbyAlreadyExists = 'LOBBY_ALREADY_EXISTS',
  MemberIsAlreadyInLobby = 'MEMBER_IS_ALREADY_IN_LOBBY',
  MemberIsNotInLobby = 'MEMBER_IS_NOT_IN_LOBBY',
  PokerIsAlreadyStarted = 'POKER_IS_ALREADY_STARTED',
  PokerIsNotStarted = 'POKER_IS_NOT_STARTED',
  UnknownMember = 'UNKNOWN_MEMBER',
}

export default ServiceErrorType;
