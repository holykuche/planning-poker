import "reflect-metadata";
import { Observable } from "rxjs";
import TelegramBot, { Message, CallbackQuery } from "node-telegram-bot-api";

import { messagesSubscriptionConstructors, callbacksSubscriptionConstructors } from "./subscriptions";

const bot = new TelegramBot(TELEGRAM_BOT_API_TOKEN, { polling: true });
bot.setMyCommands([ { command: "/help", description: "Show help message" } ])
    .catch(console.log);

const messages$ = new Observable<Message>(subscriber => {
    bot.on("message", msg => subscriber.next(msg));
});
const callbacks$ = new Observable<CallbackQuery>(subscriber => {
    bot.on("callback_query", callback => subscriber.next(callback));
});

messagesSubscriptionConstructors
    .map(SubscriptionConstructor => new SubscriptionConstructor(messages$, bot))
    .map(subscription => subscription.subscribe());

callbacksSubscriptionConstructors
    .map(SubscriptionConstructor => new SubscriptionConstructor(callbacks$, bot))
    .map(subscription => subscription.subscribe());
