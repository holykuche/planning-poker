import { User } from "node-telegram-bot-api";
import { Member } from "data/entity";
import formatTelegramUserName from "./formatTelegramUserName";

export default function(user: User): Member {
    return {
        telegramUserId: user.id,
        name: formatTelegramUserName(user),
    };
};
