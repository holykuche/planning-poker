import "reflect-metadata";
import { container } from "inversify.config";

import { SUBSCRIPTION_TYPES, AbstractSubscriptionTemplate } from "./subscriptions";

container.getAll<AbstractSubscriptionTemplate<any>>(SUBSCRIPTION_TYPES.MessageSubscription)
    .concat(container.getAll<AbstractSubscriptionTemplate<any>>(SUBSCRIPTION_TYPES.PlainTextSubscription))
    .concat(container.getAll<AbstractSubscriptionTemplate<any>>(SUBSCRIPTION_TYPES.CommandSubscription))
    .concat(container.getAll<AbstractSubscriptionTemplate<any>>(SUBSCRIPTION_TYPES.CallbackQuerySubscription))
    .forEach(subscription => subscription.subscribe());
