import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { CallbackQuery } from "node-telegram-bot-api";

import { TelegramDataService, TELEGRAM_SERVICE_TYPES } from "service/telegram-service/api";
import { MemberService, COMMON_SERVICE_TYPES } from "service/common-service/api";

import { ButtonCommand } from "../enum";
import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractCallbackQuerySubscription from "./AbstractCallbackQuerySubscription";

@injectable()
export default class RemoveCardSubscription extends AbstractCallbackQuerySubscription {

    @inject(TELEGRAM_SERVICE_TYPES.TelegramDataService) private readonly telegramDataService: TelegramDataService;
    @inject(COMMON_SERVICE_TYPES.MemberService) private readonly memberService: MemberService;

    constructor(@inject(TELEGRAM_BOT_TYPES.CallbackQueries$) callbackQueries$: Observable<CallbackQuery>) {
        super(
            callbackQueries$
                .pipe(
                    filter(callback => callback.data === ButtonCommand.RemoveCard),
                )
        );
    }

    protected handle(callbackQuery: CallbackQuery): Promise<void> {
        const member = this.telegramDataService.getMemberByTelegramUserId(callbackQuery.from.id);
        this.memberService.removeCard(member.id);
        return Promise.resolve();
    }

}
