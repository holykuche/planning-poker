import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { CallbackQuery } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { CardCode } from "data/enum";
import { MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import AbstractTelegramBotCallbackQuerySubscription from "./AbstractTelegramBotCallbackQuerySubscription";

export default class PutCardSubscription extends AbstractTelegramBotCallbackQuerySubscription {

    private static readonly PUT_CARD_COMMAND_REGEXP = /^\/put_card (Score(0|1|2|3|5|8|13|20|40|100)|DontKnow|Skip)$/;

    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(callbackQueries$: Observable<CallbackQuery>, bot: TelegramBot) {
        const putCardMessages$ = callbackQueries$
            .pipe(
                filter(callback => PutCardSubscription.PUT_CARD_COMMAND_REGEXP.test(callback.data))
            );
        super(putCardMessages$, bot);
    }

    protected handle(callbackQuery: CallbackQuery): Promise<void> {
        const cardCode = callbackQuery.data.match(PutCardSubscription.PUT_CARD_COMMAND_REGEXP)[ 1 ] as CardCode;
        const member = this.telegramDataService.getMemberByTelegramUserId(callbackQuery.from.id);
        this.memberService.putCard(member.id, cardCode);
        return Promise.resolve();
    }
}
