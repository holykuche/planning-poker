import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { CallbackQuery } from "node-telegram-bot-api";

import { MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import { ButtonCommand } from "../enum";
import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractTelegramBotCallbackQuerySubscription from "./AbstractTelegramBotCallbackQuerySubscription";

@injectable()
export default class RemoveCardSubscription extends AbstractTelegramBotCallbackQuerySubscription {

    @inject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @inject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(@inject(TELEGRAM_BOT_TYPES.CallbackQueries$) callbackQueries$: Observable<CallbackQuery>) {
        const removeCardCallbackQueries$ = callbackQueries$
            .pipe(
                filter(callback => callback.data === ButtonCommand.RemoveCard)
            );
        super(removeCardCallbackQueries$);
    }

    protected handle(callbackQuery: CallbackQuery): Promise<void> {
        const member = this.telegramDataService.getMemberByTelegramUserId(callbackQuery.from.id);
        this.memberService.removeCard(member.id);
        return Promise.resolve();
    }

}
