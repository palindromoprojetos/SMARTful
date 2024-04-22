"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eq_1 = __importDefault(require("./eq"));
class WithCTE {
    constructor(args, alias) {
        this._value = '';
        this.parse(args, alias);
    }
    get value() {
        return this._value;
    }
    parse(args, alias) {
        const eq = `;WITH ${alias} AS ` + (new eq_1.default(args)).value + `\nSELECT\n\t*\nFROM\n\t${alias}`;
        this._value = eq;
    }
}
exports.default = WithCTE;
