import { Message, CallbackQuery } from "node-telegram-bot-api";

import { TelegramBotSubscriptionConstructor } from "./TelegramBotSubscription";
import Logger from "./Logger";
import MemberEnterSubscription from "./MemberEnterSubscription";
import MemberLeaveSubscription from "./MemberLeaveSubscription";
import StartPokerSubscription from "./StartPokerSubscription";
import PutCardSubscription from "./PutCardSubscription";
import RemoveCardSubscription from "./RemoveCardSubscription";
import DeleteMessageSubscription from "./DeleteMessageSubscription";

export const messagesSubscriptionConstructors: TelegramBotSubscriptionConstructor<Message>[] = [
    Logger,
    DeleteMessageSubscription,
    MemberEnterSubscription,
    StartPokerSubscription,
];

export const callbacksSubscriptionConstructors: TelegramBotSubscriptionConstructor<CallbackQuery>[] = [
    MemberLeaveSubscription,
    PutCardSubscription,
    RemoveCardSubscription,
];
