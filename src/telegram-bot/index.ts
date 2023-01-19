import "reflect-metadata";
import { Observable } from "rxjs";
import TelegramBot, { Message } from "node-telegram-bot-api";

import subscriptionConstructors from "./subscriptions";

const bot = new TelegramBot(TELEGRAM_BOT_API_TOKEN, { polling: true });
const messages$ = new Observable<Message>(subscriber => {
    bot.on("message", msg => subscriber.next(msg));
});

Object.values(subscriptionConstructors)
    .map(SubscriptionConstructor => new SubscriptionConstructor(messages$, bot))
    .map(subscription => subscription.subscribe());
