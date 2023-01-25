import { Observable, Subscription } from "rxjs";
import TelegramBot, { InlineKeyboardButton } from "node-telegram-bot-api";

import { CardCode } from "data/enum";
import { ServiceError } from "service/error";

import { ButtonCommand } from "../enum";
import { inlineKeyboardButtonFactory, formatWarning } from "../utils";

export default abstract class AbstractTelegramBotSubscription<T> {

    protected static readonly PLAIN_TEXT_REGEXP = /^(?!\/)(.+)$/;
    protected static readonly PARSE_MODE = "MarkdownV2";
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
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.DontKnow),
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Score100),
                inlineKeyboardButtonFactory(ButtonCommand.PutCard, CardCode.Skip),
            ],
        ],
        [ ButtonCommand.RemoveCard ]: [ [ inlineKeyboardButtonFactory(ButtonCommand.RemoveCard) ] ],
    };

    protected constructor(protected readonly observable$: Observable<T>,
                          protected readonly bot?: TelegramBot) {}

    abstract subscribe(): Subscription;

    protected abstract handle(item: T): Promise<void>;

    protected abstract getChatId(item: T): number;

    protected async handleError(item: T, error: any): Promise<void> {
        if (error instanceof ServiceError) {
            const warningMessage = await this.bot.sendMessage(this.getChatId(item), formatWarning(error.getUserMessage()), {
                parse_mode: AbstractTelegramBotSubscription.PARSE_MODE,
            });
            setTimeout(async () => await this.bot.deleteMessage(this.getChatId(item), String(warningMessage.message_id)), 5000);
        }
        if (error instanceof Error) {
            console.log(`[ERROR]: ${error.message}`);
        }
    }
}

export interface TelegramBotSubscriptionConstructor<T> {
    new(observable$: Observable<T>, bot: TelegramBot): AbstractTelegramBotSubscription<T>;
}
