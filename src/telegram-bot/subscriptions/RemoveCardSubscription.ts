import { injectable, inject } from "inversify";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { CallbackQuery } from "node-telegram-bot-api";

import { TELEGRAM_SERVICE_TYPES, TelegramUserService } from "service/telegram-service/api";
import { COMMON_SERVICE_TYPES, MemberService } from "service/common-service/api";

import { ButtonCommand } from "../enum";
import { TELEGRAM_BOT_TYPES } from "../bot";

import AbstractCallbackQuerySubscription from "./AbstractCallbackQuerySubscription";

@injectable()
export default class RemoveCardSubscription extends AbstractCallbackQuerySubscription {

    @inject(TELEGRAM_SERVICE_TYPES.TelegramUserService) private readonly telegramUserService: TelegramUserService;
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
        const member = this.telegramUserService.getMemberByTelegramUserId(callbackQuery.from.id);
        this.memberService.removeCard(member.id);
        return Promise.resolve();
    }

}
