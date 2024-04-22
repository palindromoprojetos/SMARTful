"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compare_1 = __importDefault(require("./compare"));
const eq_1 = __importDefault(require("./eq"));
class NotExists extends compare_1.default {
    parse(args) {
        const pattern = "/[\t]SELECT/";
        const eq = "not exists " + (new eq_1.default(args)).value;
        this._value = eq.replace(pattern, "SELECT");
    }
}
exports.default = NotExists;
