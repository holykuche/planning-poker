import {Member} from '@/grpc-client/entity';

type MembersComparator = (left: Member, right: Member) => number;

export default function (memberId: number): MembersComparator {
  return (left, right) => {
    if (left.id === memberId) {
      return -1;
    }

    if (right.id === memberId) {
      return 1;
    }

    return left.name.localeCompare(right.name);
  };
}
