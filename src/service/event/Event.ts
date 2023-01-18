import { Lobby, Member } from "data/entity";
import { PokerResultItemDto } from "../dto";
import EventType from "./EventType";

interface EventGeneric<T extends EventType, P> {
    type: T;
    payload: P;
}

type LobbyWasDestroyedLobbyEvent = EventGeneric<EventType.LobbyWasDestroyed, { lobby: Lobby }>;
type MembersWasChangedLobbyEvent = EventGeneric<EventType.MembersWasChanged, { members: Member[] }>;
type PokerResultWasChangedLobbyEvent = EventGeneric<EventType.PokerResultWasChanged, { result: PokerResultItemDto[] }>;
type PokerWasStartedLobbyEvent = EventGeneric<EventType.PokerWasStarted, { theme: string, result: PokerResultItemDto[] }>;
type PokerWasFinishedLobbyEvent = EventGeneric<EventType.PokerWasFinished, { result: PokerResultItemDto[] }>;

type Event =
    LobbyWasDestroyedLobbyEvent
    | MembersWasChangedLobbyEvent
    | PokerResultWasChangedLobbyEvent
    | PokerWasStartedLobbyEvent
    | PokerWasFinishedLobbyEvent;

export default Event;
