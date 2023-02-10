import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { CallbackQuery } from "node-telegram-bot-api";

import { CardCode } from "data/enum";
import { MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import { TELEGRAM_BOT_TYPES } from "../bot";

import CallbackQuerySubscriptionTemplate from "./CallbackQuerySubscriptionTemplate";

@injectable()
export default class PutCardSubscription extends CallbackQuerySubscriptionTemplate {

    private static readonly PUT_CARD_COMMAND_REGEXP = /^\/put_card (Score(0|1|2|3|5|8|13|20|40|100)|DontKnow|Skip)$/;

    @inject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @inject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(@inject(TELEGRAM_BOT_TYPES.CallbackQueries$) callbackQueries$: Observable<CallbackQuery>) {
        const putCardCallbackQueries$ = callbackQueries$
            .pipe(
                filter(callback => PutCardSubscription.PUT_CARD_COMMAND_REGEXP.test(callback.data)),
            );
        super(putCardCallbackQueries$);
    }

    protected handle(callbackQuery: CallbackQuery): Promise<void> {
        const cardCode = callbackQuery.data.match(PutCardSubscription.PUT_CARD_COMMAND_REGEXP)[ 1 ] as CardCode;
        const member = this.telegramDataService.getMemberByTelegramUserId(callbackQuery.from.id);
        this.memberService.putCard(member.id, cardCode);
        return Promise.resolve();
    }
}
