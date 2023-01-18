import { Observable } from "rxjs";
import TelegramBot, { Message } from "node-telegram-bot-api";

const bot = new TelegramBot(TELEGRAM_BOT_API_TOKEN, { polling: true });

const messages$ = new Observable<Message>(subscriber => {
    bot.on("message", msg => subscriber.next(msg));
});

export { messages$ };
export default bot;
