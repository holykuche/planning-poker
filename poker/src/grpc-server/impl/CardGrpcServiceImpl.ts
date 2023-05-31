import { inject, injectable } from "inversify";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";

import { Card } from "data/entity";
import { CardService, SERVICE_TYPES } from "service/api";


import { CardGrpcService } from "../api";
import { CardCodeRequest, CardsResponse } from "../dto";

@injectable()
export default class CardGrpcServiceImpl implements CardGrpcService {

    @inject(SERVICE_TYPES.CardService)
    private readonly cardService: CardService;


    getAll(
        call: ServerUnaryCall<void, CardsResponse>,
        callback: sendUnaryData<CardsResponse>,
    ) {
        this.cardService
            .getAll()
            .then(cards => callback(null, { result: cards }))
            .catch(error => callback(error));
    }

    getByCode(
        call: ServerUnaryCall<CardCodeRequest, Card>,
        callback: sendUnaryData<Card>,
    ) {
        const { card_code } = call.request;

        this.cardService
            .getByCode(card_code)
            .then(card => callback(null, card))
            .catch(error => callback(error));
    }

}