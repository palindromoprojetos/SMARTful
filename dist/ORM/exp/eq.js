"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Eq {
    constructor(args, alias) {
        this._value = '';
        this.parse(args, alias);
    }
    get value() {
        return this._value;
    }
    parse(args, alias) {
        alias = alias ? ` as ${alias}` : '';
        const eq = '(\n\t' + args + '\n\t)' + alias;
        this._value = eq;
    }
}
exports.default = Eq;
