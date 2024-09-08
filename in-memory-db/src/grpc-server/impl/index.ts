import 'reflect-metadata';
import {container} from '@/config/inversify';

import {DatabaseGrpcService, GRPC_SERVER_TYPES} from '../api';

import DatabaseGrpcServiceImpl from './DatabaseGrpcServiceImpl';

container
  .bind<DatabaseGrpcService>(GRPC_SERVER_TYPES.DatabaseGrpcService)
  .to(DatabaseGrpcServiceImpl);
