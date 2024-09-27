import {sendUnaryData, ServerUnaryCall} from '@grpc/grpc-js';

import {Card, CardCodeRequest, CardsResponse} from '../dto';

export default interface CardGrpcService {
  getAll(
    call: ServerUnaryCall<void, CardsResponse>,
    callback: sendUnaryData<CardsResponse>
  ): void;

  getByCode(
    call: ServerUnaryCall<CardCodeRequest, Card>,
    callback: sendUnaryData<Card>
  ): void;
}
