import { CardCode } from "../enum";

export default interface Card {
    code: CardCode;
    label: string;
    value?: number;
}