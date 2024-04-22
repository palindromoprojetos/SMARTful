import Eq from "./eq";

export default class WithCTE {

    protected _value: string = '';

    constructor(args: any, alias?: string) {
        this.parse(args, alias);
    }

    get value(): string {
        return this._value;
    }

    protected parse(args: any, alias?: string) {
        const eq: string = `;WITH ${alias} AS ` + (new Eq(args)).value + `\nSELECT\n\t*\nFROM\n\t${alias}`;

        this._value = eq;
    }
}