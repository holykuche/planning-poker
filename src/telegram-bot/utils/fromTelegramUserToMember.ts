import { User } from "node-telegram-bot-api";
import { MemberDto } from "service/dto";
import formatTelegramUserName from "./formatTelegramUserName";

export default function (user: User): MemberDto {
    return {
        telegramUserId: user.id,
        name: formatTelegramUserName(user),
    };
};
