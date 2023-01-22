import { Lobby, Member } from "data/entity";
import { PokerResultItemDto, CardDto } from "../dto";
import EventType from "./EventType";

interface EventGeneric<T extends EventType, P> {
    type: T;
    payload: P;
}

type LobbyWasDestroyedLobbyEvent = EventGeneric<EventType.LobbyWasDestroyed, { lobby: Lobby }>;
type MembersWasChangedLobbyEvent = EventGeneric<EventType.MembersWasChanged, { members: Member[] }>;
type PokerResultWasChangedLobbyEvent = EventGeneric<EventType.PokerResultWasChanged, { result: PokerResultItemDto[] }>;
type PokerWasStartedLobbyEvent = EventGeneric<EventType.PokerWasStarted, { theme: string, result: PokerResultItemDto[] }>;
type PokerWasFinishedLobbyEvent = EventGeneric<EventType.PokerWasFinished, { theme: string, result: PokerResultItemDto[], totalScore: CardDto }>;

type Event =
    LobbyWasDestroyedLobbyEvent
    | MembersWasChangedLobbyEvent
    | PokerResultWasChangedLobbyEvent
    | PokerWasStartedLobbyEvent
    | PokerWasFinishedLobbyEvent;

export default Event;
