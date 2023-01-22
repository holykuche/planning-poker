import { User } from "node-telegram-bot-api";

export default function(user: User): string {
    let nameArray = [];

    if (user.first_name) {
        nameArray.push(user.first_name);
    }
    if (user.last_name) {
        nameArray.push(user.last_name);
    }
    if (!nameArray.length) {
        nameArray.push(user.username);
    }

    return nameArray.join(" ");
};
