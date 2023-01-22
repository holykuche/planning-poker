import italic from "./italic";

export default function (lobbyName: string): string {
    return `Lobby "${italic(lobbyName)}" was destroyed due no activity`;
};
