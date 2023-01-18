import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { MemberService, SERVICE_TYPES } from "service/api";

import TelegramBotSubscription from "./TelegramBotSubscription";

export default class RemoveCardSubscription extends TelegramBotSubscription {

    private static readonly REMOVE_CARD_MSG_TEXT = "/rm_card";

    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;

    constructor(messages$: Observable<Message>, bot: TelegramBot) {
        const removeCardMessages$ = messages$
            .pipe(
                filter(msg => msg.text === RemoveCardSubscription.REMOVE_CARD_MSG_TEXT)
            );
        super(removeCardMessages$, bot);
    }

    subscribe(): Subscription {
        return this.messages$
            .subscribe(msg => {
                try {
                    const member = this.memberService.getByTelegramUserId(msg.from.id);
                    this.memberService.removeCard(member.id);
                } catch (error) {
                    console.log(error);
                }
            });
    }

}
