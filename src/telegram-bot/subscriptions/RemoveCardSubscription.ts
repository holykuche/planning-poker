import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import { ButtonCommand } from "../enum";
import AbstractTelegramBotCallbackQuerySubscription from "./AbstractTelegramBotCallbackQuerySubscription";

export default class RemoveCardSubscription extends AbstractTelegramBotCallbackQuerySubscription {

    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(callbackQueries$: Observable<CallbackQuery>, bot: TelegramBot) {
        const removeCardMessages$ = callbackQueries$
            .pipe(
                filter(callback => callback.data === ButtonCommand.RemoveCard)
            );
        super(removeCardMessages$, bot);
    }

    protected handle(callbackQuery: CallbackQuery): Promise<void> {
        const member = this.telegramDataService.getMemberByTelegramUserId(callbackQuery.from.id);
        this.memberService.removeCard(member.id);
        return Promise.resolve();
    }

}
