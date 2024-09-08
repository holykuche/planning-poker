import {Lobby} from '../entity';

export default interface LobbyDAO {
  getById(id: number): Promise<Lobby>;

  getByName(name: string): Promise<Lobby>;

  save(lobby: Lobby): Promise<Lobby>;

  deleteById(id: number): Promise<void>;

  isExists(name: string): Promise<boolean>;
}
