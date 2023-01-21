import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import { ButtonCommand } from "../enum";
import TelegramBotSubscription from "./TelegramBotSubscription";

export default class RemoveCardSubscription extends TelegramBotSubscription<CallbackQuery> {

    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(callbacks$: Observable<CallbackQuery>, bot: TelegramBot) {
        const removeCardMessages$ = callbacks$
            .pipe(
                filter(callback => callback.data === ButtonCommand.RemoveCard)
            );
        super(removeCardMessages$, bot);
    }

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async callback => {
                try {
                    const member = this.telegramDataService.getMemberByTelegramUserId(callback.from.id);
                    this.memberService.removeCard(member.id);
                } catch (error) {
                    console.log(error);
                }
            });
    }

}
