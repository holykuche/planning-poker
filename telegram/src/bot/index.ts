import "reflect-metadata";
import { container } from "config/inversify";

import { SUBSCRIPTION_TYPES, AbstractSubscription } from "./subscriptions";

container.getAll<AbstractSubscription<any>>(SUBSCRIPTION_TYPES.MessageSubscription)
    .concat(container.getAll<AbstractSubscription<any>>(SUBSCRIPTION_TYPES.PlainTextSubscription))
    .concat(container.getAll<AbstractSubscription<any>>(SUBSCRIPTION_TYPES.CommandSubscription))
    .concat(container.getAll<AbstractSubscription<any>>(SUBSCRIPTION_TYPES.CallbackQuerySubscription))
    .forEach(subscription => subscription.subscribe());
