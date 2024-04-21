export default class Eq {

    protected _value: string = '';

    constructor(args: any, alias?: string) {
        this.parse(args, alias);
    }

    get value(): string {
        return this._value;
    }

    protected parse(args: any, alias?: string) {
        alias = alias ? ` as ${alias}` : '';

        const eq: string = '(\n\t' + args + '\n\t)' + alias;

        this._value = eq;
    }
}