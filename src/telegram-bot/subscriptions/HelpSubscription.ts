import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class HelpSubscription extends TelegramBotSubscription<Message> {

    private static readonly HELP_COMMAND = "/help";
    private static readonly HELP_MESSAGE =
        "If you are *not in a lobby* yet, just type *a lobby name* for become a member of that lobby\\.\n"
        + "If you are already *in a lobby*, just type *a poker theme* for starting poker\\. Any member of a lobby can do that\\.\n"
        + "If you want to *leave from a current lobby*, push button *\"Leave\"* below lobby info message\\.";

    constructor(messages$: Observable<Message>, bot?: TelegramBot) {
        const helpMessages$ = messages$
            .pipe(
                filter(msg => msg.text === HelpSubscription.HELP_COMMAND)
            );
        super(helpMessages$, bot);
    }

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async msg => {
                await this.bot.sendMessage(msg.chat.id, HelpSubscription.HELP_MESSAGE, {
                    parse_mode: HelpSubscription.PARSE_MODE,
                })
            });
    }

}