"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eq_1 = __importDefault(require("./eq"));
class Replicate {
    constructor(args, alias) {
        this._value = '';
        this.parse(args, alias);
    }
    get value() {
        return this._value;
    }
    parse(args, alias) {
        const str = args[0];
        const len = args[1];
        const pad = args[2];
        alias = alias ? ` as ${alias}` : '';
        const eq = "REPLICATE"
            + (new eq_1.default(`'${pad}', ${len} - LEN` + (new eq_1.default(str)).value)).value
            + " + CAST" + (new eq_1.default(`${str} as VARCHAR`)).value + alias;
        this._value = eq;
    }
}
exports.default = Replicate;
