import { Member } from "data/entity";

type MembersComparator = (left: Member, right: Member) => number;

export default function(telegramUserId: number): MembersComparator {
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
