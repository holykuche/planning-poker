import {container} from '@/config/inversify';

import AbstractCallbackQuerySubscription from './AbstractCallbackQuerySubscription';
import AbstractMessageSubscription from './AbstractMessageSubscription';
import AbstractSubscription from './AbstractSubscription';
import CallbackQueryLogger from './CallbackQueryLogger';
import CancelPokerSubscription from './CancelPokerSubscription';
import CommandLogger from './CommandLogger';
import DeleteMessageSubscription from './DeleteMessageSubscription';
import HelpSubscription from './HelpSubscription';
import MemberEnterSubscription from './MemberEnterSubscription';
import MemberLeaveSubscription from './MemberLeaveSubscription';
import PlainTextLogger from './PlainTextLogger';
import PutCardSubscription from './PutCardSubscription';
import RemoveCardSubscription from './RemoveCardSubscription';
import ResetUserSubscription from './ResetUserSubscription';
import StartPokerSubscription from './StartPokerSubscription';
import SUBSCRIPTION_TYPES from './types';

container
  .bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.MessageSubscription)
  .to(DeleteMessageSubscription);

container
  .bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.PlainTextSubscription)
  .to(PlainTextLogger);
container
  .bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.PlainTextSubscription)
  .to(StartPokerSubscription);
container
  .bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.PlainTextSubscription)
  .to(MemberEnterSubscription);

container
  .bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription)
  .to(CommandLogger);
container
  .bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription)
  .to(HelpSubscription);
container
  .bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription)
  .to(ResetUserSubscription);
container
  .bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription)
  .to(CancelPokerSubscription);

container
  .bind<AbstractCallbackQuerySubscription>(
    SUBSCRIPTION_TYPES.CallbackQuerySubscription
  )
  .to(CallbackQueryLogger);
container
  .bind<AbstractCallbackQuerySubscription>(
    SUBSCRIPTION_TYPES.CallbackQuerySubscription
  )
  .to(MemberLeaveSubscription);
container
  .bind<AbstractCallbackQuerySubscription>(
    SUBSCRIPTION_TYPES.CallbackQuerySubscription
  )
  .to(PutCardSubscription);
container
  .bind<AbstractCallbackQuerySubscription>(
    SUBSCRIPTION_TYPES.CallbackQuerySubscription
  )
  .to(RemoveCardSubscription);

export {SUBSCRIPTION_TYPES, AbstractSubscription};
