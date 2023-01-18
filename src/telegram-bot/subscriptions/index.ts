import { TelegramBotSubscriptionConstructor } from "./TelegramBotSubscription";
import Logger from "./Logger";
import MemberEnterSubscription from "./MemberEnterSubscription";
import MemberLeaveSubscription from "./MemberLeaveSubscription";
import StartPokerSubscription from "./StartPokerSubscription";
import PutCardSubscription from "./PutCardSubscription";
import RemoveCardSubscription from "./RemoveCardSubscription";
import DeleteMessageSubscription from "./DeleteMessageSubscription";

export default [
    Logger,
    DeleteMessageSubscription,
    MemberEnterSubscription,
    MemberLeaveSubscription,
    StartPokerSubscription,
    PutCardSubscription,
    RemoveCardSubscription,
] as TelegramBotSubscriptionConstructor[];
