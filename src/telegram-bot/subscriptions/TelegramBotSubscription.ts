import { Observable, Subscription } from "rxjs";
import TelegramBot, { Message, CallbackQuery, InlineKeyboardButton } from "node-telegram-bot-api";

import { CardCode } from "data/enum";

import { ButtonCommand } from "../enum";
import { inlineKeyboardButtonFactory } from "../utils";

export default abstract class TelegramBotSubscription<T extends Message | CallbackQuery> {

    protected static readonly INLINE_KEYBOARD: Record<ButtonCommand, InlineKeyboardButton[][]> = {
        [ ButtonCommand.Leave ]: [ [ inlineKeyboardButtonFactory(ButtonCommand.Leave) ] ],
        [ ButtonCommand.PutCard ]: [
            [
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score0),
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score1),
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score2),
            ],
            [
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score3),
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score5),
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score8),
            ],
            [
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score13),
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score20),
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score40),
            ],
            [
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score100),
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.DontKnow),
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Skip),
            ],
        ],
        [ ButtonCommand.RemoveCard ]: [ [ inlineKeyboardButtonFactory(ButtonCommand.RemoveCard) ] ],
    };

    protected constructor(protected readonly observable$: Observable<T>,
                          protected readonly bot?: TelegramBot) {}

    abstract subscribe(): Subscription;
}

export interface TelegramBotSubscriptionConstructor<T extends Message | CallbackQuery> {
    new(observable$: Observable<T>, bot: TelegramBot): TelegramBotSubscription<T>;
}
