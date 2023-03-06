import { Member } from "data/common-data/entity";
import { PokerResultItemDto } from "../dto";
import EventType from "./EventType";

interface SimpleEventGeneric<T extends EventType> {
    type: T,
}

interface EventGeneric<T extends EventType, P> extends SimpleEventGeneric<T> {
    payload: P,
}

type LobbyWasDestroyedLobbyEvent = SimpleEventGeneric<EventType.LobbyWasDestroyed>;
type MembersWasChangedLobbyEvent = EventGeneric<EventType.MembersWasChanged, { members: Member[] }>;
type PokerResultWasChangedLobbyEvent = EventGeneric<EventType.PokerResultWasChanged, { theme: string, result: PokerResultItemDto[] }>;
type PokerWasFinishedLobbyEvent = EventGeneric<EventType.PokerWasFinished, { theme: string, result: PokerResultItemDto[] }>;

type Event =
    LobbyWasDestroyedLobbyEvent
    | MembersWasChangedLobbyEvent
    | PokerResultWasChangedLobbyEvent
    | PokerWasFinishedLobbyEvent;

export default Event;
