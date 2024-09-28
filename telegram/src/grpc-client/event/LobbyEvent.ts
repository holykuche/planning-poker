import {Member, PokerResult} from '../entity';

import EventType from './EventType';

interface EventGeneric<T extends EventType, P = never> {
  type: T;
  payload?: P;
}

export type LobbyWasDestroyedLobbyEvent =
  EventGeneric<EventType.LobbyWasDestroyed>;

export type MembersWasChangedLobbyEvent = EventGeneric<
  EventType.MembersWasChanged,
  {members: Member[]}
>;

export type PokerResultWasChangedLobbyEvent = EventGeneric<
  EventType.PokerResultWasChanged,
  {theme: string; result: PokerResult[]}
>;

export type PokerWasFinishedLobbyEvent = EventGeneric<
  EventType.PokerWasFinished,
  {theme: string; result: PokerResult[]}
>;

type LobbyEvent =
  | LobbyWasDestroyedLobbyEvent
  | MembersWasChangedLobbyEvent
  | PokerResultWasChangedLobbyEvent
  | PokerWasFinishedLobbyEvent;

export default LobbyEvent;
