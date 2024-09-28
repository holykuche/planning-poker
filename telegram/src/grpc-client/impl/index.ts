import 'reflect-metadata';
import {container} from '@/config/inversify';

import {
  GRPC_CLIENT_TYPES,
  DatabaseClient,
  LobbyClient,
  MemberClient,
  SubscriptionClient,
} from '../api';

import DatabaseClientImpl from './DatabaseClientImpl';
import LobbyClientImpl from './LobbyClientImpl';
import MemberClientImpl from './MemberClientImpl';
import SubscriptionClientImpl from './SubscriptionClientImpl';

container
  .bind<DatabaseClient>(GRPC_CLIENT_TYPES.DatabaseClient)
  .to(DatabaseClientImpl);
container.bind<LobbyClient>(GRPC_CLIENT_TYPES.LobbyClient).to(LobbyClientImpl);
container
  .bind<MemberClient>(GRPC_CLIENT_TYPES.MemberClient)
  .to(MemberClientImpl);
container
  .bind<SubscriptionClient>(GRPC_CLIENT_TYPES.SubscriptionClient)
  .to(SubscriptionClientImpl);
