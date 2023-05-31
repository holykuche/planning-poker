import { Card } from "../entity";
import { CardCode } from "../enum";

export default interface CardDAO {

    getAll(): Promise<Card[]>;

    getByCode(cardCode: CardCode): Promise<Card>;

}