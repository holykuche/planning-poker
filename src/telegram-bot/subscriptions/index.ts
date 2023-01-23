import { Message, CallbackQuery } from "node-telegram-bot-api";

import { TelegramBotSubscriptionConstructor } from "./TelegramBotSubscription";
import MessageLogger from "./MessageLogger";
import CommandLogger from "./CommandLogger";
import MemberEnterSubscription from "./MemberEnterSubscription";
import MemberLeaveSubscription from "./MemberLeaveSubscription";
import StartPokerSubscription from "./StartPokerSubscription";
import PutCardSubscription from "./PutCardSubscription";
import RemoveCardSubscription from "./RemoveCardSubscription";
import DeleteMessageSubscription from "./DeleteMessageSubscription";
import HelpSubscription from "./HelpSubscription";

export const messagesSubscriptionConstructors: TelegramBotSubscriptionConstructor<Message>[] = [
    MessageLogger,
    DeleteMessageSubscription,
    StartPokerSubscription,
    MemberEnterSubscription,
    HelpSubscription,
];

export const callbacksSubscriptionConstructors: TelegramBotSubscriptionConstructor<CallbackQuery>[] = [
    CommandLogger,
    MemberLeaveSubscription,
    PutCardSubscription,
    RemoveCardSubscription,
];
