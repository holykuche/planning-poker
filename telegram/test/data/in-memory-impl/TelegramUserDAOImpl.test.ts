import 'reflect-metadata';

import {CalledWithMock, mock, MockProxy, mockReset} from 'jest-mock-extended';

import {container} from '@/config/inversify';
import {DAO_TYPES, TelegramUserDAO} from '@/data/api';
import {TelegramUserMemberXref} from '@/data/entity';
import {TableName} from '@/data/enum';
import TelegramUserDAOImpl from '@/data/impl/TelegramUserDAOImpl';
import {DatabaseClient, GRPC_CLIENT_TYPES} from '@/grpc-client/api';

describe('data/impl/TelegramUserDAOImpl', () => {
  let telegramUserDAO: TelegramUserDAO;

  let dbClientMock: MockProxy<DatabaseClient>;

  beforeAll(() => {
    container
      .bind<TelegramUserDAO>(DAO_TYPES.TelegramUserDAO)
      .to(TelegramUserDAOImpl);

    dbClientMock = mock<DatabaseClient>();
    container
      .bind<DatabaseClient>(GRPC_CLIENT_TYPES.DatabaseClient)
      .toConstantValue(dbClientMock);

    telegramUserDAO = container.get<TelegramUserDAO>(DAO_TYPES.TelegramUserDAO);
  });

  beforeEach(() => {
    mockReset(dbClientMock);
  });

  it('bindTelegramUserWithMember must save telegram user-member xref', async () => {
    const xref: TelegramUserMemberXref = {member_id: 1, telegram_user_id: 10};

    await telegramUserDAO.bindTelegramUserWithMember(
      xref.telegram_user_id,
      xref.member_id
    );

    expect(dbClientMock.save).toHaveBeenCalledWith(
      TableName.TelegramUserMemberXref,
      xref
    );
  });

  it('getMemberIdByTelegramUserId must return member ID if xref exists', async () => {
    const xref: TelegramUserMemberXref = {member_id: 1, telegram_user_id: 10};

    (
      dbClientMock.find as CalledWithMock<
        Promise<TelegramUserMemberXref>,
        [TableName, string, number]
      >
    )
      .calledWith(
        TableName.TelegramUserMemberXref,
        'telegram_user_id',
        xref.telegram_user_id
      )
      .mockReturnValue(Promise.resolve(xref));

    const resultMemberId = await telegramUserDAO.getMemberIdByTelegramUserId(
      xref.telegram_user_id
    );
    expect(resultMemberId).toBe(xref.member_id);
  });

  it("getMemberIdByTelegramUserId mustn't return member ID if xref doesn't exist", async () => {
    expect(await telegramUserDAO.getMemberIdByTelegramUserId(1)).toBeNull();
  });

  it('getTelegramUserIdByMemberId must return telegram user ID if xref exists', async () => {
    const xref: TelegramUserMemberXref = {member_id: 1, telegram_user_id: 10};

    (
      dbClientMock.find as CalledWithMock<
        Promise<TelegramUserMemberXref>,
        [TableName, string, number]
      >
    )
      .calledWith(TableName.TelegramUserMemberXref, 'member_id', xref.member_id)
      .mockReturnValue(Promise.resolve(xref));

    expect(
      await telegramUserDAO.getTelegramUserIdByMemberId(xref.member_id)
    ).toBe(xref.telegram_user_id);
  });

  it("getTelegramUserIdByMemberId mustn't return telegram user ID if xref doesn't exist", async () => {
    expect(await telegramUserDAO.getTelegramUserIdByMemberId(1)).toBeNull();
  });

  it('isMemberExists must return true if xref exists', async () => {
    const xref: TelegramUserMemberXref = {member_id: 1, telegram_user_id: 10};

    (
      dbClientMock.find as CalledWithMock<
        Promise<TelegramUserMemberXref>,
        [TableName, string, number]
      >
    )
      .calledWith(
        TableName.TelegramUserMemberXref,
        'telegram_user_id',
        xref.telegram_user_id
      )
      .mockReturnValue(Promise.resolve(xref));

    expect(
      await telegramUserDAO.isMemberExists(xref.telegram_user_id)
    ).toBeTruthy();
  });

  it("isMemberExists must return false if xref doesn't exist", async () => {
    expect(await telegramUserDAO.isMemberExists(1)).toBeFalsy();
  });

  it('unbindTelegramUserFromMember must delete telegram user-member xref', async () => {
    const telegram_user_id = 10;

    await telegramUserDAO.unbindTelegramUserFromMember(telegram_user_id);
    expect(dbClientMock.delete).toHaveBeenCalledWith(
      TableName.TelegramUserMemberXref,
      'telegram_user_id',
      telegram_user_id
    );
  });

  it('unbindMemberFromTelegramUser must delete telegram user-member xref', async () => {
    const member_id = 1;

    await telegramUserDAO.unbindMemberFromTelegramUser(member_id);
    expect(dbClientMock.delete).toHaveBeenCalledWith(
      TableName.TelegramUserMemberXref,
      'member_id',
      member_id
    );
  });
});
