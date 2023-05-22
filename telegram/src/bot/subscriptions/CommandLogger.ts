import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { Message } from "node-telegram-bot-api";

import { formatTelegramUserName } from "../utils";
import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractMessageSubscription from "./AbstractMessageSubscription";

@injectable()
export default class CommandLogger extends AbstractMessageSubscription {

    constructor(@inject(TELEGRAM_BOT_TYPES.Commands$) commands$: Observable<Message>) {
        super(commands$);
    }

    protected handle(msg: Message): Promise<void> {
        console.log(CommandLogger.format(msg));
        return Promise.resolve();
    }

    private static format(msg: Message): string {
        return `[INFO] ${ formatTelegramUserName(msg.from) } [ ${ msg.from.id } ] have typed command '${ msg.text }'`;
    }
}
