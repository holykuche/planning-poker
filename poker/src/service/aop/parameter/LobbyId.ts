import { MetadataKey } from "../common";

export default function (target: Object, propertyKey: string, parameterIndex: number) {
    Reflect.defineMetadata(MetadataKey.LobbyId, parameterIndex, target, propertyKey);
}
