import 'reflect-metadata';
import {resolve} from 'path';

import {MigrationsExecutorImpl} from 'db-migrations-executor';

import {container} from '@/config/inversify';
import {DatabaseClient, GRPC_CLIENT_TYPES} from '@/grpc-client/api';

const dbClient = container.get<DatabaseClient>(
  GRPC_CLIENT_TYPES.DatabaseClient
);

new MigrationsExecutorImpl(dbClient)
  .execute('telegram_migrations', resolve(__dirname, MIGRATION_SCRIPTS_DIR))
  .then(() => console.log('Migration completed successfully'))
  .catch(error => console.error(error));
