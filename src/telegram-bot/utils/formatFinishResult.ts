import { CardCode } from "data/enum";
import { CardDto, MemberDto, PokerResultItemDto } from "service/dto";

import italic from "./italic";
import escape from "./escape";
import membersComparatorFactory from "./membersComparatorFactory";
import bold from "./bold";

export default function (theme: string, items: PokerResultItemDto[], telegramUserId: number): string {
    const membersByCard = items
        .sort((left, right) => left.card.compareTo(right.card))
        .reduce((byCard, item) => ({
            ...byCard,
            [ item.card.code ]: (byCard[ item.card.code ] || []).concat(item.member),
        }), {} as Record<CardCode, MemberDto[]>);

    const membersComparator = membersComparatorFactory(telegramUserId);
    const result = Object.entries(membersByCard)
        .map(([ cardCode, members ]: [ CardCode, MemberDto[] ]) => ({
            cardCode,
            members: members
                .sort(membersComparator)
                .map(member => member.telegramUserId === telegramUserId
                    ? bold(italic(escape(member.name)))
                    : italic(escape(member.name)))
                .join(", "),
        }))
        .map(({ cardCode, members }) => `${ CardDto.fromCode(cardCode).label }: ${ members }`)
        .join("\n");

    return `Theme: ${ italic(escape(theme)) }\n\n${ result }`;
};
