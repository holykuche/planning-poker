import {Member} from '@/data/entity';

import {PokerResultItemDto} from '../dto';

import EventType from './EventType';

interface EventGeneric<T extends EventType, P = undefined> {
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
  {theme: string; result: PokerResultItemDto[]}
>;

export type PokerWasFinishedLobbyEvent = EventGeneric<
  EventType.PokerWasFinished,
  {theme: string; result: PokerResultItemDto[]}
>;

type LobbyEvent =
  | LobbyWasDestroyedLobbyEvent
  | MembersWasChangedLobbyEvent
  | PokerResultWasChangedLobbyEvent
  | PokerWasFinishedLobbyEvent;

export default LobbyEvent;
