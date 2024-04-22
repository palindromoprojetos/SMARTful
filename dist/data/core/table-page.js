"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablePage = void 0;
class TablePage {
    constructor(start = '0', limit = '10') {
        this._start = Number.parseInt(start ?? '0');
        this._limit = Number.parseInt(limit ?? '10');
    }
    get start() {
        return this._start;
    }
    get limit() {
        return this._limit;
    }
    set start(value) {
        this._start = value;
    }
    set limit(value) {
        this._limit = value;
    }
}
exports.TablePage = TablePage;
