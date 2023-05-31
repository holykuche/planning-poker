import { injectable } from "inversify";

import { Card } from "../entity";
import { CardCode, TableName } from "../enum";
import { CardDAO } from "../api";

import AbstractDAOImpl from "./AbstractDAOImpl";

@injectable()
export default class CardDAOImpl extends AbstractDAOImpl<Card> implements CardDAO {

    constructor() {
        super(TableName.Card);
    }

    getAll(): Promise<Card[]> {
        return this.getAll();
    }

    getByCode(cardCode: CardCode): Promise<Card> {
        return this.find("code", cardCode);
    }

}