"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eq_1 = __importDefault(require("./eq"));
class Coalesce {
    constructor(args, alias) {
        this._value = '';
        this.parse(args, alias);
    }
    get value() {
        return this._value;
    }
    parse(args, alias) {
        args = (args instanceof Array) ? args.join(", ").trim() : args;
        alias = alias ? ` as ${alias}` : '';
        const eq = "COALESCE " + (new eq_1.default(args)).value + alias;
        this._value = eq;
    }
}
exports.default = Coalesce;
