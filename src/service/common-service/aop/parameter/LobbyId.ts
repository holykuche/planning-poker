import MetadataKey from "../MetadataKey";

export default function (target: Object, propertyKey: string, parameterIndex: number) {
    Reflect.defineMetadata(MetadataKey.LobbyId, parameterIndex, target, propertyKey);
}
