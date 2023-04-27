import { MetadataKey } from "../common";

export default function (target: Object, propertyKey: string, parameterIndex: number) {
    Reflect.defineMetadata(MetadataKey.MemberId, parameterIndex, target, propertyKey);
};
