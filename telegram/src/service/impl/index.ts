import 'reflect-metadata';
import {container} from '@/config/inversify';

import {
  SERVICE_TYPES,
  LobbyService,
  MemberService,
  TelegramMessageService,
  TelegramUserService,
  SubscriptionService,
} from '../api';

import LobbyServiceImpl from './LobbyServiceImpl';
import MemberServiceImpl from './MemberServiceImpl';
import SubscriptionServiceImpl from './SubscriptionServiceImpl';
import TelegramMessageServiceImpl from './TelegramMessageServiceImpl';
import TelegramUserServiceImpl from './TelegramUserServiceImpl';

container.bind<LobbyService>(SERVICE_TYPES.LobbyService).to(LobbyServiceImpl);
container
  .bind<MemberService>(SERVICE_TYPES.MemberService)
  .to(MemberServiceImpl);
container
  .bind<TelegramMessageService>(SERVICE_TYPES.TelegramMessageService)
  .to(TelegramMessageServiceImpl);
container
  .bind<TelegramUserService>(SERVICE_TYPES.TelegramUserService)
  .to(TelegramUserServiceImpl);
container
  .bind<SubscriptionService>(SERVICE_TYPES.SubscriptionService)
  .to(SubscriptionServiceImpl);
