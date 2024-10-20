import {User} from 'node-telegram-bot-api';

export default function (user: User): string {
  const nameArray: string[] = [];

  if (user.first_name) {
    nameArray.push(user.first_name);
  }
  if (user.last_name) {
    nameArray.push(user.last_name);
  }
  if (!nameArray.length && user.username) {
    nameArray.push(user.username);
  }

  return nameArray.join(' ') || '<no user name part is defined>';
}
