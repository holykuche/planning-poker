import {MemberLobbyXrefDAO} from '@/data/api';

import MetadataKey from './MetadataKey';

interface Dependencies {
  memberLobbyXrefDAO: MemberLobbyXrefDAO;
}

export default function (
  dependencies: Dependencies,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[],
  target: object,
  propertyKey: string
): Promise<number> {
  const lobbyIdParameterIndex = Reflect.getOwnMetadata(
    MetadataKey.LobbyId,
    target,
    propertyKey
  );
  const memberIdParameterIndex = Reflect.getOwnMetadata(
    MetadataKey.MemberId,
    target,
    propertyKey
  );

  if (typeof lobbyIdParameterIndex === 'number') {
    return Promise.resolve(args[lobbyIdParameterIndex]);
  } else if (typeof memberIdParameterIndex === 'number') {
    const memberId = args[memberIdParameterIndex];
    return dependencies.memberLobbyXrefDAO.getMembersBinding(memberId);
  } else {
    return Promise.reject(
      new Error(
        "Can't resolve lobbyId. You should mark lobbyId or memberId in parameters."
      )
    );
  }
}
