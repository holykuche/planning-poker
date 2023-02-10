import { container } from "inversify.config";

import SUBSCRIPTION_TYPES from "./types";
import AbstractSubscriptionTemplate from "./AbstractSubscriptionTemplate";
import MessageSubscriptionTemplate from "./MessageSubscriptionTemplate";
import CallbackQuerySubscriptionTemplate from "./CallbackQuerySubscriptionTemplate";
import PlainTextLogger from "./PlainTextLogger";
import CommandLogger from "./CommandLogger";
import CallbackQueryLogger from "./CallbackQueryLogger";
import MemberEnterSubscription from "./MemberEnterSubscription";
import MemberLeaveSubscription from "./MemberLeaveSubscription";
import StartPokerSubscription from "./StartPokerSubscription";
import PutCardSubscription from "./PutCardSubscription";
import RemoveCardSubscription from "./RemoveCardSubscription";
import DeleteMessageSubscription from "./DeleteMessageSubscription";
import HelpSubscription from "./HelpSubscription";
import ResetUserSubscription from "./ResetUserSubscription";

container.bind<MessageSubscriptionTemplate>(SUBSCRIPTION_TYPES.MessageSubscription).to(DeleteMessageSubscription);

container.bind<MessageSubscriptionTemplate>(SUBSCRIPTION_TYPES.PlainTextSubscription).to(PlainTextLogger);
container.bind<MessageSubscriptionTemplate>(SUBSCRIPTION_TYPES.PlainTextSubscription).to(StartPokerSubscription);
container.bind<MessageSubscriptionTemplate>(SUBSCRIPTION_TYPES.PlainTextSubscription).to(MemberEnterSubscription);

container.bind<MessageSubscriptionTemplate>(SUBSCRIPTION_TYPES.CommandSubscription).to(CommandLogger);
container.bind<MessageSubscriptionTemplate>(SUBSCRIPTION_TYPES.CommandSubscription).to(HelpSubscription);
container.bind<MessageSubscriptionTemplate>(SUBSCRIPTION_TYPES.CommandSubscription).to(ResetUserSubscription);

container.bind<CallbackQuerySubscriptionTemplate>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(CallbackQueryLogger);
container.bind<CallbackQuerySubscriptionTemplate>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(MemberLeaveSubscription);
container.bind<CallbackQuerySubscriptionTemplate>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(PutCardSubscription);
container.bind<CallbackQuerySubscriptionTemplate>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(RemoveCardSubscription);

export { SUBSCRIPTION_TYPES, AbstractSubscriptionTemplate };
