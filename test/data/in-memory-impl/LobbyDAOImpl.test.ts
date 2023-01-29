import "reflect-metadata";
import { LobbyState } from "data/enum";
import LobbyDAOImpl from "data/in-memory-impl/LobbyDAOImpl";

describe("data/in-memory-impl/LobbyDAOImpl", () => {

    let lobbyDAO: LobbyDAOImpl;

    beforeEach(() => {
        lobbyDAO = new LobbyDAOImpl();
    });

    it("save should return a new object", () => {
        const storedLobby1 = lobbyDAO.save({ name: "dummy name", state: LobbyState.Waiting, currentTheme: "dummy theme" });
        const storedLobby2 = lobbyDAO.save(storedLobby1);

        expect(storedLobby2).not.toBe(storedLobby1);
    });

    it("save should assign ID to lobby without ID", () => {
        const storedLobby = lobbyDAO.save({ name: "dummy name", state: LobbyState.Waiting, currentTheme: "dummy theme" });

        expect(storedLobby.id).toBeDefined();
    });

    it("save should return lobby with the same property values", () => {
        const lobby = { name: "dummy name", state: LobbyState.Waiting, currentTheme: "dummy theme" };
        const storedLobby = lobbyDAO.save(lobby);

        expect(storedLobby.name).toBe(lobby.name);
        expect(storedLobby.state).toBe(lobby.state);
        expect(storedLobby.currentTheme).toBe(lobby.currentTheme);
    });

    it("getById should return stored lobby", () => {
        const lobbies = [
            { name: "dummy name 1", state: LobbyState.Waiting, currentTheme: "dummy theme 1" },
            { name: "dummy name 2", state: LobbyState.Waiting, currentTheme: "dummy theme 2" },
            { name: "dummy name 3", state: LobbyState.Waiting, currentTheme: "dummy theme 3" },
            { name: "dummy name 4", state: LobbyState.Waiting, currentTheme: "dummy theme 4" },
            { name: "dummy name 5", state: LobbyState.Waiting, currentTheme: "dummy theme 5" },
        ];

        lobbies
            .map(lobby => lobbyDAO.save(lobby))
            .map(storedLobby => [ storedLobby, lobbyDAO.getById(storedLobby.id) ])
            .forEach(([ storedLobby, receivedLobby ]) => expect(receivedLobby).toEqual(storedLobby));
    });

    it("getById should return a new object", () => {
        const storedLobby = lobbyDAO.save({ name: "dummy name", state: LobbyState.Waiting });
        const receivedLobby = lobbyDAO.getById(storedLobby.id);

        expect(receivedLobby).not.toBe(storedLobby);
    });

    it("getById shouldn't return not stored lobby", () => {
        const receivedLobby = lobbyDAO.getById(1);

        expect(receivedLobby).toBeNull();
    });

    it("getByName should return stored lobby", () => {
        const lobbies = [
            { name: "dummy name 1", state: LobbyState.Waiting, currentTheme: "dummy theme 1" },
            { name: "dummy name 2", state: LobbyState.Waiting, currentTheme: "dummy theme 2" },
            { name: "dummy name 3", state: LobbyState.Waiting, currentTheme: "dummy theme 3" },
            { name: "dummy name 4", state: LobbyState.Waiting, currentTheme: "dummy theme 4" },
            { name: "dummy name 5", state: LobbyState.Waiting, currentTheme: "dummy theme 5" },
        ];

        lobbies
            .map(lobby => lobbyDAO.save(lobby))
            .map(storedLobby => [ storedLobby, lobbyDAO.getByName(storedLobby.name) ])
            .forEach(([ storedLobby, receivedLobby ]) => expect(receivedLobby).toEqual(storedLobby));
    });

    it("getByName shouldn't return not stored lobby", () => {
        const receivedLobby = lobbyDAO.getByName("dummy name");

        expect(receivedLobby).toBeNull();
    });

    it("getByName should return a new object", () => {
        const storedLobby = lobbyDAO.save({ name: "dummy name", state: LobbyState.Waiting });
        const receivedLobby = lobbyDAO.getByName(storedLobby.name);

        expect(receivedLobby).not.toBe(storedLobby);
    });

    it("deleteById should delete stored lobby", () => {
        const storedLobby = lobbyDAO.save({ name: "dummy name", state: LobbyState.Waiting });
        lobbyDAO.deleteById(storedLobby.id);
        const receivedLobby = lobbyDAO.getById(storedLobby.id);

        expect(receivedLobby).toBeNull();
    });

    it("isExists should return true for stored lobby", () => {
        const storedLobby = lobbyDAO.save({ name: "dummy name", state: LobbyState.Waiting });

        expect(lobbyDAO.isExists(storedLobby.name)).toBeTruthy();
    });

    it("isExists should return false for not stored lobby", () => {
        const notStoredLobbyName = "dummy name";

        expect(lobbyDAO.isExists(notStoredLobbyName)).toBeFalsy();
    });
});