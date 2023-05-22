import { CardCode } from "data/enum";
import { CardDto, PokerResultItemDto, TelegramMemberDto } from "service/dto";

import italic from "./italic";
import escape from "./escape";
import bold from "./bold";
import membersComparatorFactory from "./membersComparatorFactory";
import compareCards from "./compareCards";

export default function (theme: string, items: PokerResultItemDto[], telegramUserId: number): string {
    const membersByCard = items
        .sort((left, right) => compareCards(left.card, right.card))
        .reduce((byCard, item) => ({
            ...byCard,
            [ item.card.code ]: (byCard[ item.card.code ] || []).concat(item.member),
        }), {} as Record<CardCode, TelegramMemberDto[]>);
    const cardsByCode = items
        .map(item => item.card)
        .reduce((byCode, card) => ({
            ...byCode,
            [ card.code ]: card,
        }), {} as Record<CardCode, CardDto>);

    const membersComparator = membersComparatorFactory(telegramUserId);
    const result = Object.entries(membersByCard)
        .map(([ cardCode, members ]: [ CardCode, TelegramMemberDto[] ]) => ({
            cardCode,
            members: members
                .sort(membersComparator)
                .map(member => member.telegramUserId === telegramUserId
                    ? bold(italic(escape(member.name)))
                    : italic(escape(member.name)))
                .join(", "),
        }))
        .map(({ cardCode, members }) => `${ cardsByCode[ cardCode ].label }: ${ members }`)
        .join("\n");

    return `Theme: ${ italic(escape(theme)) }\n\n${ result }`;
};
