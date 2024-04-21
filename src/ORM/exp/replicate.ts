import Eq from "./eq";

export default class Replicate {

    protected _value: string = '';

    constructor(args: Array<string>, alias?: string) {
        this.parse(args, alias);
    }

    get value(): string {
        return this._value;
    }

    protected parse(args: Array<string>, alias?: string) {
        const str: string = args[0];
        const len: string = args[1];
        const pad: string = args[2];

        alias = alias ? ` as ${alias}` : '';

        const eq: string = "REPLICATE" 
            + (new Eq(`'${pad}', ${len} - LEN` + (new Eq(str)).value)).value 
            + " + CAST" + (new Eq(`${str} as VARCHAR`)).value + alias;

        this._value = eq;
    }
}