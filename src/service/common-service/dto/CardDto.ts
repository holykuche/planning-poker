import { CardCode } from "data/common-data/enum";

export default class CardDto<T extends CardCode = CardCode> {

    private constructor(public readonly code: T, public readonly label: string, private readonly value?: number) {
    }

    private static readonly values: Map<CardCode, CardDto> = new Map<CardCode, CardDto>([
        [ CardCode.Score0, new CardDto(CardCode.Score0, "0", 0) ],
        [ CardCode.Score1, new CardDto(CardCode.Score1, "1", 1) ],
        [ CardCode.Score2, new CardDto(CardCode.Score2, "2", 2) ],
        [ CardCode.Score3, new CardDto(CardCode.Score3, "3", 3) ],
        [ CardCode.Score5, new CardDto(CardCode.Score5, "5", 5) ],
        [ CardCode.Score8, new CardDto(CardCode.Score8, "8", 8) ],
        [ CardCode.Score13, new CardDto(CardCode.Score13, "13", 13) ],
        [ CardCode.Score20, new CardDto(CardCode.Score20, "20", 20) ],
        [ CardCode.Score40, new CardDto(CardCode.Score40, "40", 40) ],
        [ CardCode.Score100, new CardDto(CardCode.Score100, "100", 100) ],
        [ CardCode.DontKnow, new CardDto(CardCode.DontKnow, "?") ],
        [ CardCode.Skip, new CardDto(CardCode.Skip, "Skip") ],
    ]);

    static fromCode<T extends CardCode>(code: T): CardDto<T> {
        return CardDto.values.get(code) as CardDto<T> || null;
    }

    compareTo(card: CardDto): number {
        if (card.code === CardCode.DontKnow) {
            return -1;
        }
        if (this.code === CardCode.DontKnow) {
            return 1;
        }

        if (card.code === CardCode.Skip) {
            return -1;
        }
        if (this.code === CardCode.Skip) {
            return 1;
        }

        return this.value - card.value;
    }

}
