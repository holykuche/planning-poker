import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import TelegramBot, { Message } from "node-telegram-bot-api";

import { lazyInject } from "inversify.config";
import { CardCode } from "data/enum";
import { MemberService, SERVICE_TYPES, TelegramDataService } from "service/api";

import TelegramBotSubscription from "./TelegramBotSubscription";

export default class PutCardSubscription extends TelegramBotSubscription {

    private static readonly PUT_CARD_REGEXP = /^\/put_card (Score(0|1|2|3|5|8|13|20|40|100)|DontKnow|Skip)$/;

    @lazyInject(SERVICE_TYPES.MemberService) private readonly memberService: MemberService;
    @lazyInject(SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;

    constructor(messages$: Observable<Message>, bot: TelegramBot) {
        const putCardMessages$ = messages$
            .pipe(
                filter(msg => PutCardSubscription.PUT_CARD_REGEXP.test(msg.text))
            );
        super(putCardMessages$, bot);
    }

    subscribe(): Subscription {
        return this.messages$
            .subscribe(async msg => {
                const cardCode = msg.text.match(PutCardSubscription.PUT_CARD_REGEXP)[ 1 ] as CardCode;

                try {
                    const member = this.telegramDataService.getMemberByTelegramUserId(msg.from.id);
                    this.memberService.putCard(member.id, cardCode);
                } catch (error) {
                    console.log(error);
                }
            });
    }
}
