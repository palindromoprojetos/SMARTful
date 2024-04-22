"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exp = exports.PregReplace = void 0;
const eq_1 = __importDefault(require("./eq"));
const orx_1 = __importDefault(require("./orx"));
const andx_1 = __importDefault(require("./andx"));
const exists_1 = __importDefault(require("./exists"));
const concat_1 = __importDefault(require("./concat"));
const withcte_1 = __importDefault(require("./withcte"));
const casewhen_1 = __importDefault(require("./casewhen"));
const coalesce_1 = __importDefault(require("./coalesce"));
const notexists_1 = __importDefault(require("./notexists"));
const replicate_1 = __importDefault(require("./replicate"));
function PregReplace(pattern, replacement, subject, flags) {
    const patt = new RegExp(pattern, flags ?? 'g');
    return subject.replace(patt, replacement);
}
exports.PregReplace = PregReplace;
class Exp {
    constructor(sql) {
        this._value = '';
        this._value = sql;
    }
    get value() {
        return this._value;
    }
    eq(args, alias) {
        const sqlPart = new eq_1.default(args, alias);
        this._value = sqlPart.value;
        return this._value;
    }
    orX(args) {
        const sqlPart = new orx_1.default(args);
        this._value = sqlPart.value;
        return this._value;
    }
    andX(args) {
        const sqlPart = new andx_1.default(args);
        this._value = sqlPart.value;
        return this._value;
    }
    caseWhen(condition, args, alias) {
        const sqlPart = new casewhen_1.default(condition, args, alias);
        this._value = sqlPart.value;
        return this._value;
    }
    exists(args) {
        const sqlPart = new exists_1.default(args);
        this._value = sqlPart.value;
        return this._value;
    }
    notExists(args) {
        const sqlPart = new notexists_1.default(args);
        this._value = sqlPart.value;
        return this._value;
    }
    coalesce(args, alias) {
        const sqlPart = new coalesce_1.default(args, alias);
        this._value = sqlPart.value;
        return this._value;
    }
    withCTE(args, alias) {
        const sqlPart = new withcte_1.default(args, alias);
        this._value = sqlPart.value;
        return this._value;
    }
    concat(args, alias) {
        const sqlPart = new concat_1.default(args, alias);
        this._value = sqlPart.value;
        return this._value;
    }
    replicate(args, alias) {
        const sqlPart = new replicate_1.default(args, alias);
        this._value = sqlPart.value;
        return this._value;
    }
}
exports.Exp = Exp;
