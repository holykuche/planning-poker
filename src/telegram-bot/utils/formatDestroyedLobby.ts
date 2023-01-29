import italic from "./italic";
import escape from "./escape";

export default function (lobbyName: string): string {
    return `Lobby "${italic(escape(lobbyName))}" was destroyed due to no activity`;
};
