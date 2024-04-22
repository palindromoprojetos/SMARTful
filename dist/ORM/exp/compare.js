"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Compare {
    constructor(args) {
        this._value = '';
        this._pattern = '/\([\n]|\(|\s+\)/';
        this.parse(args);
    }
    parse(args) { }
    get value() {
        return this._value;
    }
}
exports.default = Compare;
