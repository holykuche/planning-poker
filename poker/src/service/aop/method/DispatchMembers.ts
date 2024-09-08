import {container} from '@/config/inversify';
import {DAO_TYPES, MemberDAO, MemberLobbyXrefDAO} from '@/data/api';
import {Member} from '@/data/entity';

import {SERVICE_TYPES, SubscriptionService} from '../../api';
import {EventType} from '../../event';
import {resolveLobbyId} from '../common';

interface Dependencies {
  memberLobbyXrefDAO: MemberLobbyXrefDAO;
  memberDAO: MemberDAO;
  subscriptionService: SubscriptionService;
}

const getMembers = (
  dependencies: Dependencies,
  lobbyId: number
): Promise<Member[]> => {
  return dependencies.memberLobbyXrefDAO
    .getMemberIdsByLobbyId(lobbyId)
    .then(memberIds => dependencies.memberDAO.getByIds(memberIds));
};

export default (
  target: object,
  propertyKey: string,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  descriptor: TypedPropertyDescriptor<Function>
) => {
  const method = descriptor.value;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  descriptor.value = async (...args: any[]) => {
    const result = method.apply(this, args);

    const dependencies: Dependencies = {
      memberLobbyXrefDAO: container.get<MemberLobbyXrefDAO>(
        DAO_TYPES.MemberLobbyXrefDAO
      ),
      memberDAO: container.get<MemberDAO>(DAO_TYPES.MemberDAO),
      subscriptionService: container.get<SubscriptionService>(
        SERVICE_TYPES.SubscriptionService
      ),
    };

    const lobbyId = await resolveLobbyId(
      dependencies,
      args,
      target,
      propertyKey
    );
    const members = await getMembers(dependencies, lobbyId);

    await dependencies.subscriptionService.dispatch(lobbyId, {
      type: EventType.MembersWasChanged,
      payload: {members},
    });

    return result;
  };
};
