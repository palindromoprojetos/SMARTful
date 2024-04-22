export default class CaseWhen {

    protected _value: string = '';

    constructor(condition: string, args: any, alias?: string) {
        this.parse(condition, args, alias);
    }

    get value(): string {
        return this._value;
    }

    protected parse(condition: string, args: any, alias?: string) {
        args = (args instanceof Array) ? args.join("\n\t\t ").trim() : `\n\t\t${args}`;
        
        alias = alias ? `\n\tEND as ${alias}` : `\n\tEND as ${alias}`;

        this._value = `CASE ${condition} ${args} ${alias}`;
    }
}