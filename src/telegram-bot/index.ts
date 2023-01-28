import "reflect-metadata";
import { container } from "inversify.config";

import { SUBSCRIPTION_TYPES, AbstractTelegramBotSubscription } from "./subscriptions";

container.getAll<AbstractTelegramBotSubscription<any>>(SUBSCRIPTION_TYPES.MessageSubscription)
    .concat(container.getAll<AbstractTelegramBotSubscription<any>>(SUBSCRIPTION_TYPES.PlainTextSubscription))
    .concat(container.getAll<AbstractTelegramBotSubscription<any>>(SUBSCRIPTION_TYPES.CommandSubscription))
    .concat(container.getAll<AbstractTelegramBotSubscription<any>>(SUBSCRIPTION_TYPES.CallbackQuerySubscription))
    .forEach(subscription => subscription.subscribe());
