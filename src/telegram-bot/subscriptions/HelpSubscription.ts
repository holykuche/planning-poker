import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import AbstractTelegramBotMessageSubscription from "./AbstractTelegramBotMessageSubscription";

export default class HelpSubscription extends AbstractTelegramBotMessageSubscription {

    private static readonly HELP_COMMAND_REGEXP = /^\/(help)|(start)$/;
    private static readonly HELP_MESSAGE =
        "_1\\. Enter to lobby_\n"
        + "If you are *not in a lobby* yet, just type *a lobby name* for become a member of that lobby\\.\n\n"
        + "_2\\. Start poker_\n"
        + "If you are already *in a lobby*, just type *a poker theme* for start poker\\. Any member of a lobby can do that\\.\n\n"
        + "_3\\. Leave from lobby_\n"
        + "If you want to *leave from a current lobby*, push button *\"Leave\"* below lobby info message\\.";

    constructor(messages$: Observable<Message>, bot?: TelegramBot) {
        const helpMessages$ = messages$
            .pipe(
                filter(msg => HelpSubscription.HELP_COMMAND_REGEXP.test(msg.text))
            );
        super(helpMessages$, bot);
    }

    protected async handle(msg: TelegramBot.Message): Promise<void> {
        await this.bot.sendMessage(msg.chat.id, HelpSubscription.HELP_MESSAGE, {
            parse_mode: HelpSubscription.PARSE_MODE,
        });
    }
}