import Eq from "./eq";

export default class Coalesce {

    protected _value: string = '';

    constructor(args: any, alias?: string) {
        this.parse(args, alias);
    }

    get value(): string {
        return this._value;
    }

    protected parse(args: any, alias?: string) {
        args = (args instanceof Array) ? args.join(", ").trim() : args;

        alias = alias ? ` as ${alias}` : '';

        const eq: string = "COALESCE " + (new Eq(args)).value + alias;

        this._value = eq;
    }
}