import { container } from "config/inversify";

import SUBSCRIPTION_TYPES from "./types";
import AbstractSubscription from "./AbstractSubscription";
import AbstractMessageSubscription from "./AbstractMessageSubscription";
import AbstractCallbackQuerySubscription from "./AbstractCallbackQuerySubscription";
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
import CancelPokerSubscription from "./CancelPokerSubscription";

container.bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.MessageSubscription).to(DeleteMessageSubscription);

container.bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.PlainTextSubscription).to(PlainTextLogger);
container.bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.PlainTextSubscription).to(StartPokerSubscription);
container.bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.PlainTextSubscription).to(MemberEnterSubscription);

container.bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription).to(CommandLogger);
container.bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription).to(HelpSubscription);
container.bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription).to(ResetUserSubscription);
container.bind<AbstractMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription).to(CancelPokerSubscription);

container.bind<AbstractCallbackQuerySubscription>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(CallbackQueryLogger);
container.bind<AbstractCallbackQuerySubscription>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(MemberLeaveSubscription);
container.bind<AbstractCallbackQuerySubscription>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(PutCardSubscription);
container.bind<AbstractCallbackQuerySubscription>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(RemoveCardSubscription);

export { SUBSCRIPTION_TYPES, AbstractSubscription };
