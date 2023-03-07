import { TelegramMemberDto } from "service/telegram-service/dto";

type MembersComparator = (left: TelegramMemberDto, right: TelegramMemberDto) => number;

export default function (telegramUserId: number): MembersComparator {
    return (left, right) => {
        if (left.telegramUserId === telegramUserId) {
            return -1;
        }

        if (right.telegramUserId === telegramUserId) {
            return 1;
        }

        return left.name.localeCompare(right.name);
    };
};
