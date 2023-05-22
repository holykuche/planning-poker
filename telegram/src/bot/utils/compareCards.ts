import { CardDto } from "service/dto";
import { CardCode } from "data/enum";

export default function (left: CardDto, right: CardDto) {
    if (right.code === CardCode.DontKnow) {
        return -1;
    }
    if (left.code === CardCode.DontKnow) {
        return 1;
    }

    if (right.code === CardCode.Skip) {
        return -1;
    }
    if (left.code === CardCode.Skip) {
        return 1;
    }

    return left.value - right.value;
}