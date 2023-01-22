import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { CardCode } from "data/enum";
import { MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import TelegramBotSubscription from "./TelegramBotSubscription";

export default class PutCardSubscription extends TelegramBotSubscription<CallbackQuery> {

    private static readonly PUT_CARD_COMMAND_REGEXP = /^\/put_card (Score(0|1|2|3|5|8|13|20|40|100)|DontKnow|Skip)$/;

    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(callbacks$: Observable<CallbackQuery>, bot: TelegramBot) {
        const putCardMessages$ = callbacks$
            .pipe(
                filter(callback => PutCardSubscription.PUT_CARD_COMMAND_REGEXP.test(callback.data))
            );
        super(putCardMessages$, bot);
    }

    subscribe(): Subscription {
        return this.observable$
            .subscribe(async callback => {
                const cardCode = callback.data.match(PutCardSubscription.PUT_CARD_COMMAND_REGEXP)[ 1 ] as CardCode;

                try {
                    const member = this.telegramDataService.getMemberByTelegramUserId(callback.from.id);
                    this.memberService.putCard(member.id, cardCode);
                } catch (error) {
                    await this.handleError(callback.message.chat.id, error);
                }
            });
    }
}
