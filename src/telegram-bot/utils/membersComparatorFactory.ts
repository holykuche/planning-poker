import { MemberDto } from "service/dto";

type MembersComparator = (left: MemberDto, right: MemberDto) => number;

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
