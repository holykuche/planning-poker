import 'reflect-metadata';

import {CalledWithMock, mock, MockProxy, mockReset} from 'jest-mock-extended';

import {container} from '@/config/inversify';
import {DAO_TYPES, MemberLobbyXrefDAO} from '@/data/api';
import {MemberLobbyXref} from '@/data/entity';
import {TableName} from '@/data/enum';
import MemberLobbyXrefDAOImpl from '@/data/impl/MemberLobbyXrefDAOImpl';
import {DatabaseClient, GRPC_CLIENT_TYPES} from '@/grpc-client/api';

import {sameObject} from '@test/test-utils/customMatchers';

describe('data/impl/MemberLobbyXrefDAOImpl', () => {
  let memberLobbyXrefDAO: MemberLobbyXrefDAO;

  let dbClientMock: MockProxy<DatabaseClient>;

  beforeAll(() => {
    container
      .bind<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO)
      .to(MemberLobbyXrefDAOImpl);

    dbClientMock = mock<DatabaseClient>();
    container
      .bind<DatabaseClient>(GRPC_CLIENT_TYPES.DatabaseClient)
      .toConstantValue(dbClientMock);

    memberLobbyXrefDAO = container.get<MemberLobbyXrefDAO>(
      DAO_TYPES.MemberLobbyXrefDAO
    );
  });

  beforeEach(() => {
    mockReset(dbClientMock);
  });

  it('bindMember should send save query to db', () => {
    const xref: MemberLobbyXref = {member_id: 1, lobby_id: 10};

    dbClientMock.save
      .calledWith(TableName.MemberLobbyXref, sameObject(xref))
      .mockReturnValue(Promise.resolve(xref));

    return memberLobbyXrefDAO
      .bindMember(xref.member_id, xref.lobby_id)
      .then(() => {
        expect(dbClientMock.save).toBeCalledWith(
          TableName.MemberLobbyXref,
          xref
        );
      });
  });

  it('getMembersBinding should send find query to db', () => {
    const xref: MemberLobbyXref = {member_id: 1, lobby_id: 10};

    (
      dbClientMock.find as CalledWithMock<
        Promise<MemberLobbyXref>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.MemberLobbyXref, 'member_id', xref.member_id)
      .mockReturnValue(Promise.resolve(xref));

    return memberLobbyXrefDAO
      .getMembersBinding(xref.member_id)
      .then(lobby_id => {
        expect(dbClientMock.find).toBeCalledWith(
          TableName.MemberLobbyXref,
          'member_id',
          xref.member_id
        );
        expect(lobby_id).toBe(xref.lobby_id);
      });
  });

  it('getMemberIdsByLobbyId should send findMany query to db', () => {
    const xrefs: MemberLobbyXref[] = [
      {member_id: 1, lobby_id: 10},
      {member_id: 2, lobby_id: 10},
      {member_id: 3, lobby_id: 10},
      {member_id: 4, lobby_id: 10},
      {member_id: 5, lobby_id: 10},
    ];

    (
      dbClientMock.findMany as CalledWithMock<
        Promise<MemberLobbyXref[]>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.MemberLobbyXref, 'lobby_id', xrefs[0].lobby_id)
      .mockReturnValue(Promise.resolve(xrefs));

    return memberLobbyXrefDAO
      .getMemberIdsByLobbyId(xrefs[0].lobby_id)
      .then(returnedMemberIds => {
        expect(dbClientMock.findMany).toBeCalledWith(
          TableName.MemberLobbyXref,
          'lobby_id',
          xrefs[0].lobby_id
        );
        expect(returnedMemberIds).toEqual(xrefs.map(xref => xref.member_id));
      });
  });

  it('unbindMember should send delete query to db', () => {
    const xref: MemberLobbyXref = {member_id: 1, lobby_id: 10};

    (
      dbClientMock.delete as CalledWithMock<
        Promise<void>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.MemberLobbyXref, 'member_id', xref.member_id)
      .mockReturnValue(Promise.resolve());

    return memberLobbyXrefDAO.unbindMember(xref.member_id).then(() => {
      expect(dbClientMock.delete).toBeCalledWith(
        TableName.MemberLobbyXref,
        'member_id',
        xref.member_id
      );
    });
  });

  it('unbindMembers should send delete query to db', () => {
    const xref: MemberLobbyXref = {member_id: 1, lobby_id: 10};

    (
      dbClientMock.delete as CalledWithMock<
        Promise<void>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.MemberLobbyXref, 'lobby_id', xref.lobby_id)
      .mockReturnValue(Promise.resolve());

    return memberLobbyXrefDAO.unbindMembers(xref.lobby_id).then(() => {
      expect(dbClientMock.delete).toBeCalledWith(
        TableName.MemberLobbyXref,
        'lobby_id',
        xref.lobby_id
      );
    });
  });

  it('isMemberBound should send find query to db', () => {
    const xref: MemberLobbyXref = {member_id: 1, lobby_id: 10};

    (
      dbClientMock.find as CalledWithMock<
        Promise<MemberLobbyXref>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.MemberLobbyXref, 'member_id', xref.member_id)
      .mockReturnValue(Promise.resolve(xref));

    return memberLobbyXrefDAO.isMemberBound(xref.member_id).then(isBound => {
      expect(dbClientMock.find).toBeCalledWith(
        TableName.MemberLobbyXref,
        'member_id',
        xref.member_id
      );
      expect(isBound).toBe(true);
    });
  });
});
