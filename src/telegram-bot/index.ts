import "reflect-metadata";
import subscriptionConstructors from "./subscriptions";
import bot, { messages$ } from "./bot";

Object.values(subscriptionConstructors)
    .map(SubscriptionConstructor => new SubscriptionConstructor(messages$, bot))
    .map(subscription => subscription.subscribe());
