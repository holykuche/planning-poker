import {EventType} from '@/service/event';

import LobbyEventPayload from './LobbyEventPayload';

export default interface LobbyEvent {
  type: EventType;
  payload: LobbyEventPayload;
}
