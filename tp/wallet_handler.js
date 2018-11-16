const { TransactionHandler } = require('sawtooth-sdk/processor/handler');
const { InternalError, InvalidTransaction } = require('sawtooth-sdk').exceptions;
const { decodeData, hash } = require('../lib/helper');
const cbor = require('cbor');
const FAMILY_NAME = "wallet-family", VERSION = "1.0", NAMESPACE = ["wallet", "wallfam", hash(FAMILY_NAME).substr(0, 6)];

class WalletHandler extends TransactionHandler {

    constructor() {
        super(FAMILY_NAME, [VERSION], NAMESPACE);
    }

    apply(transactionRequest, context) {
        return decodeData(transactionRequest.payload)
            .then((payload) => {/**
             * Name : john
             * Amount : 1000
             */
                if (!payload.action) {
                    throw new InvalidTransaction("Payload doesn't contain the action");
                }
                if (!payload.id) {
                    throw new InvalidTransaction("Payload doesn't contain the ID");
                }
                if (!payload.data) {
                    throw new InvalidTransaction("Payload doesn't contain the Data");
                }
                let action = payload.action;
                let address = NAMESPACE[2] + hash(id).substring(0, 64);
                switch (action) {
                    case "deposit":
                        let entries = {
                            [address]: cbor.encode(payload.data)
                        }
                        context.setState(entries);
                    case "withdraw":
                        context.getState([address])
                            .then((possibleAddressValues) => {
                                let stateValue = possibleAddressValues[address];
                                if (stateValue && stateValue.length) {
                                    let value = cbor.decodeFirstSync(stateValue);
                                    if (value[id]) {
                                        if (value[id].amount - payload['data']['amount'] >= 0) {
                                            value[id].amount = value[id].amount - payload['data']['amount'];
                                        } else {
                                            throw new InvalidTransaction("Insufficiant Funds to complete the tranaction");
                                        }
                                        let entries = {
                                            [address]: cbor.encode(value[id])
                                        }
                                        context.setState(entries);
                                    }
                                }
                            });
                    default:
                        throw new InvalidTransaction("The action is Invalid or not supported by this transaction processor");
                }

            })
            .catch((err) => {
                throw new InternalError("Error While Decoding the payload");
            })
    }

}

module.exports = WalletHandler;