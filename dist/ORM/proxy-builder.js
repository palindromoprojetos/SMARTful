"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyBuilder = void 0;
const msnodesqlv8_1 = __importDefault(require("msnodesqlv8"));
const smartful_data_1 = require("../data/smartful.data");
const connectionString = (config) => {
    let connString = JSON.stringify(config);
    connString = connString.replaceAll(':', '=').replaceAll(',', ';').replaceAll('"', '');
    return connString.substring(1, connString.length - 1);
};
class ProxyBuilder {
    constructor() { }
    static async create(config) {
        if (!ProxyBuilder._instance) {
            let connString = connectionString(config.dtb);
            ProxyBuilder._instance = new ProxyBuilder();
            ProxyBuilder._conn = await msnodesqlv8_1.default.promises.open(connString);
        }
        return ProxyBuilder._instance;
    }
    static get instance() {
        return ProxyBuilder._instance;
    }
    async transaction() {
        await ProxyBuilder._conn.promises.beginTransaction();
    }
    async commit() {
        await ProxyBuilder._conn.promises.commit();
    }
    async rollback() {
        await ProxyBuilder._conn.promises.rollback();
    }
    async query(script) {
        const result = new smartful_data_1.ResultSet();
        const query = await ProxyBuilder._conn.promises.query(script);
        result.setRows(query.first ?? []);
        return result;
    }
    async lastId() {
        const result = await this.query('SELECT @@IDENTITY as ID');
        return result.first.id;
    }
}
exports.ProxyBuilder = ProxyBuilder;
