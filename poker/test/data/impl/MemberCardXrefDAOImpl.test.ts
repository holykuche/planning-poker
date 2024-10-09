import 'reflect-metadata';

import {CalledWithMock, mock, MockProxy, mockReset} from 'jest-mock-extended';

import {container} from '@/config/inversify';
import {MemberCardXrefDAO, DAO_TYPES} from '@/data/api';
import {MemberCardXref} from '@/data/entity';
import {CardCode, TableName} from '@/data/enum';
import MemberCardXrefDAOImpl from '@/data/impl/MemberCardXrefDAOImpl';
import {DatabaseClient, GRPC_CLIENT_TYPES} from '@/grpc-client/api';

import {sameObject} from '@test/test-utils/customMatchers';

describe('data/impl/MemberCardXrefDAOImpl', () => {
  let memberCardXrefDAO: MemberCardXrefDAO;

  let dbClientMock: MockProxy<DatabaseClient>;

  beforeAll(() => {
    container
      .bind<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO)
      .to(MemberCardXrefDAOImpl);

    dbClientMock = mock<DatabaseClient>();
    container
      .bind<DatabaseClient>(GRPC_CLIENT_TYPES.DatabaseClient)
      .toConstantValue(dbClientMock);

    memberCardXrefDAO = container.get<MemberCardXrefDAO>(
      DAO_TYPES.MemberCardXrefDAO
    );
  });

  beforeEach(() => {
    mockReset(dbClientMock);
  });

  it('put should send save query to db', () => {
    const xref: MemberCardXref = {member_id: 1, card_code: CardCode.DontKnow};

    dbClientMock.save
      .calledWith(TableName.MemberCardXref, sameObject(xref))
      .mockReturnValue(Promise.resolve(xref));

    return memberCardXrefDAO.put(xref.member_id, xref.card_code).then(() => {
      expect(dbClientMock.save).toBeCalledWith(TableName.MemberCardXref, xref);
    });
  });

  it('getCardByMemberId should send find query to db', () => {
    const xref: MemberCardXref = {member_id: 1, card_code: CardCode.DontKnow};

    (
      dbClientMock.find as CalledWithMock<
        Promise<MemberCardXref>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.MemberCardXref, 'member_id', xref.member_id)
      .mockReturnValue(Promise.resolve(xref));

    return memberCardXrefDAO.getCardByMemberId(xref.member_id).then(card => {
      expect(dbClientMock.find).toBeCalledWith(
        TableName.MemberCardXref,
        'member_id',
        xref.member_id
      );
      expect(card).toBe(xref.card_code);
    });
  });

  // todo: it needs to make DatabaseClient able to send bulk find queries
  it('getCardsByMemberIds should send find query to db many times', () => {
    const xrefs: MemberCardXref[] = [
      {member_id: 1, card_code: CardCode.DontKnow},
      {member_id: 2, card_code: CardCode.Skip},
      {member_id: 3, card_code: CardCode.Score100},
      {member_id: 4, card_code: CardCode.Score40},
      {member_id: 5, card_code: CardCode.Score0},
    ];
    const memberIds = xrefs.map(xref => xref.member_id);

    xrefs.forEach(xref => {
      (
        dbClientMock.find as CalledWithMock<
          Promise<MemberCardXref>,
          [TableName, string, number]
        >
      )
        .calledWith(TableName.MemberCardXref, 'member_id', xref.member_id)
        .mockReturnValue(Promise.resolve(xref));
    });

    return memberCardXrefDAO
      .getCardsByMemberIds(memberIds)
      .then(receivedXrefs => {
        receivedXrefs.forEach(xref => {
          expect(dbClientMock.find).toBeCalledWith(
            TableName.MemberCardXref,
            'member_id',
            xref.member_id
          );
        });
        expect(receivedXrefs).toEqual(xrefs);
      });
  });

  it('removeByMemberId should send delete query to db', () => {
    const xref: MemberCardXref = {member_id: 1, card_code: CardCode.DontKnow};

    (
      dbClientMock.delete as CalledWithMock<
        Promise<void>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.MemberCardXref, 'member_id', xref.member_id)
      .mockReturnValue(Promise.resolve());

    return memberCardXrefDAO.removeByMemberId(xref.member_id).then(() => {
      expect(dbClientMock.delete).toBeCalledWith(
        TableName.MemberCardXref,
        'member_id',
        xref.member_id
      );
    });
  });

  // todo: need to make DatabaseClient able to send bulk delete queries
  it('removeByMemberIds should send delete query to db many times', () => {
    const xrefs: MemberCardXref[] = [
      {member_id: 1, card_code: CardCode.DontKnow},
      {member_id: 2, card_code: CardCode.Skip},
      {member_id: 3, card_code: CardCode.Score100},
      {member_id: 4, card_code: CardCode.Score40},
      {member_id: 5, card_code: CardCode.Score0},
    ];
    const memberIds = xrefs.map(xref => xref.member_id);

    xrefs.forEach(xref => {
      (
        dbClientMock.delete as CalledWithMock<
          Promise<void>,
          [TableName, string, number]
        >
      )
        .calledWith(TableName.MemberCardXref, 'member_id', xref.member_id)
        .mockReturnValue(Promise.resolve());
    });

    return memberCardXrefDAO.removeByMemberIds(memberIds).then(() => {
      xrefs.forEach(xref => {
        expect(dbClientMock.delete).toBeCalledWith(
          TableName.MemberCardXref,
          'member_id',
          xref.member_id
        );
      });
    });
  });
});
