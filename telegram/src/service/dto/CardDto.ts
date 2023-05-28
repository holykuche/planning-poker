import { CardCode } from "grpc-client/enum";

export default interface CardDto {
    code: CardCode;
    label: string;
    value?: number;
}
