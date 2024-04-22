"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CaseWhen {
    constructor(condition, args, alias) {
        this._value = '';
        this.parse(condition, args, alias);
    }
    get value() {
        return this._value;
    }
    parse(condition, args, alias) {
        args = (args instanceof Array) ? args.join("\n\t\t ").trim() : `\n\t\t${args}`;
        alias = alias ? `\n\tEND as ${alias}` : `\n\tEND as ${alias}`;
        this._value = `CASE ${condition} ${args} ${alias}`;
    }
}
exports.default = CaseWhen;
