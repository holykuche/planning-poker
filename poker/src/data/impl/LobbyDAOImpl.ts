import {injectable} from 'inversify';

import {LobbyDAO} from '../api';
import {Lobby} from '../entity';
import {TableName} from '../enum';

import AbstractDAOImpl from './AbstractDAOImpl';

@injectable()
export default class LobbyDAOImpl
  extends AbstractDAOImpl<Lobby>
  implements LobbyDAO
{
  constructor() {
    super(TableName.Lobby);
  }

  getById(id: number): Promise<Lobby> {
    return this.find('id', id);
  }

  getByName(name: string): Promise<Lobby> {
    return this.find('name', name);
  }

  deleteById(id: number): Promise<void> {
    return this.delete('id', id);
  }

  isExists(name: string): Promise<boolean> {
    return this.getByName(name).then(lobby => !!lobby);
  }
}
