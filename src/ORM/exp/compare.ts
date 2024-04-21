
interface ICompare {
    parse(args: string): void;
}

export default abstract class Compare implements ICompare {

    protected _value: string = '';

    protected _pattern: string = '/\([\n]|\(|\s+\)/';

    constructor(args: any) {
        this.parse(args);
    }

    parse(args: any): void {}

    get value(): string {
        return this._value;
    }
}
