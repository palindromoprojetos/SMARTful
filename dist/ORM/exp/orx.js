"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compare_1 = __importDefault(require("./compare"));
const eq_1 = __importDefault(require("./eq"));
class OrX extends compare_1.default {
    parse(args) {
        let eq;
        if (args instanceof Array) {
            eq = (new eq_1.default(args.join("\n\t OR ").trim())).value;
        }
        else {
            eq = (new eq_1.default(args)).value;
        }
        this._value = eq.replace(this._pattern, '');
    }
}
exports.default = OrX;
