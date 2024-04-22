"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultSet = void 0;
const smartful_utils_1 = require("../../utils/smartful.utils");
const smartful_data_1 = require("../smartful.data");
class ResultSet {
    constructor() {
        this.toJson = () => JSON.stringify(this._data, null, 2);
        this.toObject = () => JSON.parse(this.toJson());
        this._data = {
            text: ResultSet.OK,
            rows: Array(),
            paging: 0,
            status: smartful_utils_1.HttpStatus.OK,
            records: 0,
            success: true,
            message: new smartful_data_1.MessageError(),
        };
    }
    get data() {
        return this._data;
    }
    get first() {
        const rows = this._data.rows;
        return (rows.length != 0) ? rows[0] : rows;
    }
    get text() {
        return this._data.text;
    }
    get rows() {
        return this._data.rows;
    }
    set rows(rows) {
        this._data.rows = rows;
    }
    get status() {
        return this._data.status;
    }
    get paging() {
        return this._data.paging;
    }
    get records() {
        return this._data.records;
    }
    get message() {
        return this._data.message;
    }
    get success() {
        return this._data.success;
    }
    getFields(column) {
        const rows = Array();
        this._data.rows.forEach((item) => {
            const data = {};
            column.forEach((name) => data[name] = item[name.toLowerCase()]);
            rows.push(data);
        });
        return rows;
    }
    /**
     * Convert true -> '1', false -> '0'
     * @param value
     * @returns converted value
     */
    bit(value) {
        let convert;
        switch (value.toLowerCase()) {
            case 'null':
                convert = '';
                break;
            case 'true':
                convert = '1';
                break;
            case 'false':
                convert = '0';
                break;
            default:
                convert = value;
                break;
        }
        return convert;
    }
    setRows(value) {
        value.forEach((row, index) => {
            value[index] = Object.fromEntries(Object.entries(row).map(([k, v]) => {
                k = k.toLowerCase().toString();
                return ((typeof v) == 'object') ? [k, v] : [k, this.bit(`${v}`)];
            }));
        });
        this._data.rows = value;
        this._data.records = Number.parseInt(`${value.length}`);
        return this;
    }
    setText(value) {
        this._data.text = value ?? '';
        return this;
    }
    setStatus(value) {
        this._data.status = value;
        return this;
    }
    setPaging(records, limit) {
        if (limit != undefined) {
            const rest = records % limit;
            const page = Math.floor(records / limit);
            this._data.paging = rest != 0 ? (page + 1) : page;
        }
        else {
            this._data.paging = records;
        }
        return this;
    }
    setRecords(value) {
        this._data.records = Number.parseInt(`${value}`);
        return this;
    }
    setSuccess(value) {
        this._data.success = value;
        this._data.text = (this._data.text == ResultSet.OK && !value) ? '' : this._data.text;
        return this;
    }
    setMessage(value) {
        this._data.message = new smartful_data_1.MessageError();
        if (value instanceof smartful_data_1.MessageError) {
            this._data.message = value;
            this._data.text = value.message;
            this._data.status = value.status;
        }
        return this;
    }
}
exports.ResultSet = ResultSet;
ResultSet.OK = 'OK';
ResultSet.EMPTY_RESULT = 'Não há registros a serem mostrados!';
ResultSet.FAILURE_STATEMENT = 'Houve falha na execução da solicitação!';
