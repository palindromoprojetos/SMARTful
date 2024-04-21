import Eq from "./eq";
import OrX from "./orx";
import AndX from "./andx";
import Exists from "./exists";
import Concat from "./concat";
import WithCTE from "./withcte";
import CaseWhen from "./casewhen";
import Coalesce from "./coalesce";
import NotExists from "./notexists";
import Replicate from "./replicate";

export function PregReplace(
    pattern: string,
    replacement: string,
    subject: string,
    flags?: string
): string {
    const patt = new RegExp(pattern, flags ?? 'g');
    return subject.replace(patt, replacement);
}

export class Exp {

    protected _value: string = '';

    constructor(sql: string) {
        this._value = sql;
    }

    get value(): string {
        return this._value;
    }

    eq(args: any, alias?: string): string {
        const sqlPart: Eq = new Eq(args, alias);

        this._value = sqlPart.value;

        return this._value;
    }

    orX(args: any): string {
        const sqlPart: OrX = new OrX(args);

        this._value = sqlPart.value;

        return this._value;
    }

    andX(args: any): string {
        const sqlPart: AndX = new AndX(args);

        this._value = sqlPart.value;

        return this._value;
    }

    caseWhen(condition: string, args: any, alias?: string): string {
        const sqlPart: CaseWhen = new CaseWhen(condition, args, alias);

        this._value = sqlPart.value;

        return this._value;
    }

    exists(args: any): string {
        const sqlPart: Exists = new Exists(args);

        this._value = sqlPart.value;

        return this._value;
    }

    notExists(args: any): string {
        const sqlPart: NotExists = new NotExists(args);

        this._value = sqlPart.value;

        return this._value;
    }

    coalesce(args: any, alias?: string): string {
        const sqlPart: Coalesce = new Coalesce(args, alias);

        this._value = sqlPart.value;

        return this._value;
    }

    withCTE(args: any, alias?: string): string {
        const sqlPart: WithCTE = new WithCTE(args, alias);

        this._value = sqlPart.value;

        return this._value;
    }

    concat(args: any, alias?: string): string {
        const sqlPart: Concat = new Concat(args, alias);

        this._value = sqlPart.value;

        return this._value;
    }

    replicate(args: any, alias?: string): string {
        const sqlPart: Replicate = new Replicate(args, alias);

        this._value = sqlPart.value;

        return this._value;
    }

}

