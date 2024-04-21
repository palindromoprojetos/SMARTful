export class TablePage {

    private _start: number;
    private _limit: number;

    constructor(
        start: string = '0', 
        limit: string = '10'
    ) {
        this._start = Number.parseInt(start ?? '0');
        this._limit = Number.parseInt(limit ?? '10');
    }

    get start(): number {
        return this._start;
    }

    get limit(): number {
        return this._limit;
    }

    set start(value: number) {
        this._start = value;
    }

    set limit(value: number) {
        this._limit = value;
    }
}