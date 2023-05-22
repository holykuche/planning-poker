import { CardCode } from "data/enum";

export default interface CardDto {
    code: CardCode;
    label: string;
    value?: number;
}
