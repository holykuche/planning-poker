import { container } from "inversify.config";

import SUBSCRIPTION_TYPES from "./types";
import AbstractTelegramBotSubscription from "./AbstractTelegramBotSubscription";
import AbstractTelegramBotMessageSubscription from "./AbstractTelegramBotMessageSubscription";
import AbstractTelegramBotCallbackQuerySubscription from "./AbstractTelegramBotCallbackQuerySubscription";
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

container.bind<AbstractTelegramBotMessageSubscription>(SUBSCRIPTION_TYPES.MessageSubscription).to(DeleteMessageSubscription);

container.bind<AbstractTelegramBotMessageSubscription>(SUBSCRIPTION_TYPES.PlainTextSubscription).to(PlainTextLogger);
container.bind<AbstractTelegramBotMessageSubscription>(SUBSCRIPTION_TYPES.PlainTextSubscription).to(StartPokerSubscription);
container.bind<AbstractTelegramBotMessageSubscription>(SUBSCRIPTION_TYPES.PlainTextSubscription).to(MemberEnterSubscription);

container.bind<AbstractTelegramBotMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription).to(CommandLogger);
container.bind<AbstractTelegramBotMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription).to(HelpSubscription);
container.bind<AbstractTelegramBotMessageSubscription>(SUBSCRIPTION_TYPES.CommandSubscription).to(ResetUserSubscription);

container.bind<AbstractTelegramBotCallbackQuerySubscription>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(CallbackQueryLogger);
container.bind<AbstractTelegramBotCallbackQuerySubscription>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(MemberLeaveSubscription);
container.bind<AbstractTelegramBotCallbackQuerySubscription>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(PutCardSubscription);
container.bind<AbstractTelegramBotCallbackQuerySubscription>(SUBSCRIPTION_TYPES.CallbackQuerySubscription).to(RemoveCardSubscription);

export { SUBSCRIPTION_TYPES, AbstractTelegramBotSubscription };
