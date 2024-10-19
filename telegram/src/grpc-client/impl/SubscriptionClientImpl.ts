import {injectable} from 'inversify';

import {SubscriptionClient} from '../api';
import {LobbyEvent} from '../event';

import AbstractPokerClientImpl from './AbstractPokerClientImpl';

@injectable()
export default class SubscriptionClientImpl
  extends AbstractPokerClientImpl
  implements SubscriptionClient
{
  constructor() {
    super('SubscriptionService');
  }

  subscribe(
    lobby_id: number,
    member_id: number,
    next: (event: LobbyEvent) => void,
    handleError: (error: Error) => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        super
          .callClientReadableStreamMethod<LobbyEvent>('Subscribe', {
            lobby_id,
            member_id,
          })
          .on('data', next)
          .on('error', handleError);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  unsubscribe(member_id: number): Promise<void> {
    return super.promiseFactory('Unsubscribe', {member_id});
  }

  register(lobby_id: number): Promise<void> {
    return super.promiseFactory('Register', {lobby_id});
  }

  unregister(lobby_id: number): Promise<void> {
    return super.promiseFactory('Unregister', {lobby_id});
  }

  dispatch(lobby_id: number, event: LobbyEvent): Promise<void> {
    return super.promiseFactory('Dispatch', {lobby_id, event});
  }
}
