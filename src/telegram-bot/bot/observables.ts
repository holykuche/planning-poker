import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Message, CallbackQuery } from "node-telegram-bot-api";

import bot from "./bot";

const PLAIN_TEXT_REGEXP = /^(?!\/).+$/;
const COMMAND_REGEXP = /^\/.+$/;

export const messages$ = new Observable<Message>(subscriber => {
    bot.on("message", msg => subscriber.next(msg));
});

export const plainTexts$ = messages$
    .pipe(
        filter(msg => !!msg.text),
        filter(msg => PLAIN_TEXT_REGEXP.test(msg.text))
    );

export const commands$ = messages$
    .pipe(
        filter(msg => !!msg.text),
        filter(msg => COMMAND_REGEXP.test(msg.text))
    );

export const callbackQueries$ = new Observable<CallbackQuery>(subscriber => {
    bot.on("callback_query", callback => subscriber.next(callback));
});
