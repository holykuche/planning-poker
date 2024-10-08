import {
  ServerUnaryCall,
  ServerWritableStream,
  sendUnaryData,
} from '@grpc/grpc-js';
import {inject, injectable} from 'inversify';

import {SERVICE_TYPES, SubscriptionService} from '@/service/api';
import {LobbyEvent as ServiceLobbyEvent} from '@/service/event';

import {SubscriptionGrpcService} from '../api';
import {
  MemberIdLobbyIdRequest,
  LobbyEvent,
  MemberIdRequest,
  LobbyIdRequest,
  LobbyIdLobbyEventRequest,
} from '../dto';

import AbstractGrpcServiceImpl from './AbstractGrpcServiceImpl';

@injectable()
export default class SubscriptionGrpcServiceImpl
  extends AbstractGrpcServiceImpl
  implements SubscriptionGrpcService
{
  @inject(SERVICE_TYPES.SubscriptionService)
  private readonly subscriptionService: SubscriptionService;

  constructor() {
    super();
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
    this.register = this.register.bind(this);
    this.unregister = this.unregister.bind(this);
    this.dispatch = this.dispatch.bind(this);
  }

  subscribe(
    call: ServerWritableStream<MemberIdLobbyIdRequest, LobbyEvent>
  ): void {
    const {lobby_id, member_id} = call.request;

    this.subscriptionService.subscribe(lobby_id, member_id, event =>
      call.write({type: event.type, payload: event.payload})
    );
  }

  unsubscribe(
    call: ServerUnaryCall<MemberIdRequest, void>,
    callback: sendUnaryData<void>
  ): void {
    try {
      const {member_id} = call.request;

      this.subscriptionService.unsubscribe(member_id);
      callback(null);
    } catch (e) {
      callback(SubscriptionGrpcServiceImpl.fromServiceErrorToGrpcError(e));
    }
  }

  register(
    call: ServerUnaryCall<LobbyIdRequest, void>,
    callback: sendUnaryData<void>
  ): void {
    try {
      const {lobby_id} = call.request;

      this.subscriptionService.register(lobby_id);
      callback(null);
    } catch (e) {
      callback(SubscriptionGrpcServiceImpl.fromServiceErrorToGrpcError(e));
    }
  }

  unregister(
    call: ServerUnaryCall<LobbyIdRequest, void>,
    callback: sendUnaryData<void>
  ): void {
    try {
      const {lobby_id} = call.request;

      this.subscriptionService.unregister(lobby_id);
      callback(null);
    } catch (e) {
      callback(SubscriptionGrpcServiceImpl.fromServiceErrorToGrpcError(e));
    }
  }

  dispatch(
    call: ServerUnaryCall<LobbyIdLobbyEventRequest, void>,
    callback: sendUnaryData<void>
  ): void {
    try {
      const {lobby_id, event} = call.request;

      this.subscriptionService.dispatch(lobby_id, event as ServiceLobbyEvent);
      callback(null);
    } catch (e) {
      callback(SubscriptionGrpcServiceImpl.fromServiceErrorToGrpcError(e));
    }
  }
}
