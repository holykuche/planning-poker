import "reflect-metadata";
import { CalledWithMock, mock, MockProxy, mockReset } from "jest-mock-extended";

import { container } from "config/inversify";
import { LobbyState, TableName } from "data/enum";
import { LobbyDAO, DAO_TYPES } from "data/api";
import { DatabaseClient, DB_CLIENT_TYPES } from "db-client/api";
import { Lobby } from "data/entity";

import { sameObject } from "../../test-utils/customMatchers";

import LobbyDAOImpl from "data/impl/LobbyDAOImpl";

describe("data/common-data/in-memory-impl/LobbyDAOImpl", () => {

    let lobbyDAO: LobbyDAO;

    let dbClientMock: MockProxy<DatabaseClient>;

    beforeAll(() => {
        container.bind<LobbyDAO>(DAO_TYPES.LobbyDAO).to(LobbyDAOImpl);

        dbClientMock = mock<DatabaseClient>();
        container.bind<DatabaseClient>(DB_CLIENT_TYPES.DatabaseClient).toConstantValue(dbClientMock);

        lobbyDAO = container.get<LobbyDAO>(DAO_TYPES.LobbyDAO);
    });

    beforeEach(() => {
        mockReset(dbClientMock);
    });

    it("save should send save query to db", () => {
        const lobby = {
            name: "dummy name",
            state: LobbyState.Waiting,
            currentTheme: "dummy theme",
        };

        const storedLobby = { id: 1, ...lobby };

        dbClientMock.save
            .calledWith(TableName.Lobby, sameObject(lobby))
            .mockReturnValue(Promise.resolve(storedLobby));

        lobbyDAO.save(lobby)
            .then(returnedLobby => {
                expect(dbClientMock.save).toBeCalledWith(TableName.Lobby, lobby);
                expect(returnedLobby).toEqual(storedLobby);
            });
    });

    it("getById should send find query to db", () => {
        const lobby = {
            id: 1,
            name: "dummy name 1",
            state: LobbyState.Waiting,
            currentTheme: "dummy theme 1",
        };

        (dbClientMock.find as CalledWithMock<Promise<Lobby>, [ TableName, string, number ]>)
            .calledWith(TableName.Lobby, "id", lobby.id)
            .mockReturnValue(Promise.resolve(lobby));

        lobbyDAO.getById(lobby.id)
            .then(returnedLobby => {
                expect(dbClientMock.find).toBeCalledWith(TableName.Lobby, "id", lobby.id);
                expect(returnedLobby).toEqual(lobby);
            })
    });

    it("getByName should send find query to db", () => {
        const lobby = {
            id: 1,
            name: "dummy name 1",
            state: LobbyState.Waiting,
            currentTheme: "dummy theme 1",
        };

        (dbClientMock.find as CalledWithMock<Promise<Lobby>, [ TableName, string, string ]>)
            .calledWith(TableName.Lobby, "name", lobby.name)
            .mockReturnValue(Promise.resolve(lobby));

        lobbyDAO.getByName(lobby.name)
            .then(returnedLobby => {
                expect(dbClientMock.find).toBeCalledWith(TableName.Lobby, "name", lobby.name);
                expect(returnedLobby).toEqual(lobby);
            })
    });

    it("deleteById should send delete query to db", () => {
        const lobbyId = 1;

        (dbClientMock.delete as CalledWithMock<Promise<void>, [ TableName, string, number ]>)
            .calledWith(TableName.Lobby, "id", lobbyId)
            .mockReturnValue(Promise.resolve());

        lobbyDAO.deleteById(lobbyId)
            .then(() => {
                expect(dbClientMock.delete).toBeCalledWith(TableName.Lobby, "id", lobbyId);
            });
    });

    it("isExists should send find query to db", async () => {
        const lobby = {
            id: 1,
            name: "dummy name 1",
            state: LobbyState.Waiting,
            currentTheme: "dummy theme 1",
        };

        (dbClientMock.find as CalledWithMock<Promise<Lobby>, [ TableName, string, string ]>)
            .calledWith(TableName.Lobby, "name", lobby.name)
            .mockReturnValue(Promise.resolve(lobby));

        lobbyDAO.isExists(lobby.name)
            .then(isExists => {
                expect(dbClientMock.find).toBeCalledWith(TableName.Lobby, "name", lobby.name);
                expect(isExists).toBe(true);
            });
    });
});