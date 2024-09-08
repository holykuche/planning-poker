import 'reflect-metadata';
import {container} from '@/config/inversify';

import {
  GRPC_CLIENT_TYPES,
  DatabaseClient,
  LobbyClient,
  MemberClient,
} from '../api';

import DatabaseClientImpl from './DatabaseClientImpl';
import LobbyClientImpl from './LobbyClientImpl';
import MemberClientImpl from './MemberClientImpl';

container
  .bind<DatabaseClient>(GRPC_CLIENT_TYPES.DatabaseClient)
  .to(DatabaseClientImpl);
container.bind<LobbyClient>(GRPC_CLIENT_TYPES.LobbyClient).to(LobbyClientImpl);
container
  .bind<MemberClient>(GRPC_CLIENT_TYPES.MemberClient)
  .to(MemberClientImpl);
