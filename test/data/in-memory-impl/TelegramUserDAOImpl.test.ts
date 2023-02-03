import "reflect-metadata";

import { TelegramUserMemberXref } from "data/entity";

import TelegramUserDAOImpl from "data/in-memory-impl/TelegramUserDAOImpl";

describe("data/in-memory-impl/TelegramUserDAOImpl", () => {

    let telegramUserDAO: TelegramUserDAOImpl;

    beforeEach(() => {
        telegramUserDAO = new TelegramUserDAOImpl();
    });

    it("bindTelegramUserWithMember should save telegram user-member xref", () => {
        const xref: TelegramUserMemberXref = { memberId: 1, telegramUserId: 10 };

        telegramUserDAO.bindTelegramUserWithMember(xref.telegramUserId, xref.memberId);
        expect(telegramUserDAO.find("telegramUserId", xref.telegramUserId)).toEqual(xref);
        expect(telegramUserDAO.find("memberId", xref.memberId)).toEqual(xref);
    });

    it("getMemberIdByTelegramUserId should return member ID if xref exists", () => {
        const xref: TelegramUserMemberXref = { memberId: 1, telegramUserId: 10 };

        telegramUserDAO.save(xref);
        expect(telegramUserDAO.getMemberIdByTelegramUserId(xref.telegramUserId)).toBe(xref.memberId);
    });

    it("getMemberIdByTelegramUserId shouldn't return member ID if xref doesn't exist", () => {
        expect(telegramUserDAO.getMemberIdByTelegramUserId(1)).toBeNull();
    });

    it("getTelegramUserIdByMemberId should return telegram user ID if xref exists", () => {
        const xref: TelegramUserMemberXref = { memberId: 1, telegramUserId: 10 };

        telegramUserDAO.save(xref);
        expect(telegramUserDAO.getTelegramUserIdByMemberId(xref.memberId)).toBe(xref.telegramUserId);
    });

    it("getTelegramUserIdByMemberId shouldn't return telegram user ID if xref doesn't exist", () => {
        expect(telegramUserDAO.getTelegramUserIdByMemberId(1)).toBeNull();
    });

    it("isMemberExists should return true if xref exists", () => {
        const xref: TelegramUserMemberXref = { memberId: 1, telegramUserId: 10 };

        telegramUserDAO.save(xref);
        expect(telegramUserDAO.isMemberExists(xref.telegramUserId)).toBeTruthy();
    });

    it("isMemberExists should return false if xref doesn't exist", () => {
        expect(telegramUserDAO.isMemberExists(1)).toBeFalsy();
    });

    it("unbindTelegramUserFromMember should delete telegram user-member xref", () => {
        const xref: TelegramUserMemberXref = { memberId: 1, telegramUserId: 10 };

        telegramUserDAO.save(xref);
        telegramUserDAO.unbindTelegramUserFromMember(xref.telegramUserId);
        expect(telegramUserDAO.find("telegramUserId", xref.telegramUserId)).toBeNull();
        expect(telegramUserDAO.find("memberId", xref.memberId)).toBeNull();
    });

    it("unbindMemberFromTelegramUser should delete telegram user-member xref", () => {
        const xref: TelegramUserMemberXref = { memberId: 1, telegramUserId: 10 };

        telegramUserDAO.save(xref);
        telegramUserDAO.unbindMemberFromTelegramUser(xref.memberId);
        expect(telegramUserDAO.find("telegramUserId", xref.telegramUserId)).toBeNull();
        expect(telegramUserDAO.find("memberId", xref.memberId)).toBeNull();
    });
});