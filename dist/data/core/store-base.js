"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreBase = void 0;
const smartful_orm_1 = require("../../ORM/smartful.orm");
const smartful_utils_1 = require("../../utils/smartful.utils");
const smartful_data_1 = require("../smartful.data");
const moment_1 = __importDefault(require("moment"));
class StoreBase {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.qbd = smartful_orm_1.QueryBuilder.instance;
        this.mdb = smartful_orm_1.MongoBuilder.instance;
    }
    get annotation() {
        return smartful_utils_1.smn.getMetaData(this.constructor.name);
    }
    get modelName() {
        return this.annotation.Store.model;
    }
    get model() {
        const model = smartful_utils_1.mmn.getMetaData(this.modelName);
        return model;
    }
    async sendMessages(event, module, value) {
        let result = new smartful_data_1.ResultSet();
        let update = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        let thread = (new String(smartful_utils_1.smn.thread)).padStart(2, '0');
        try {
            const data = {
                type: event.toUpperCase(),
                module: module,
                update: update,
                status: value.status,
                success: value.success,
                ...value
            };
            // Envia para o SocketServer
            smartful_utils_1.serverIO.to(data.room).emit(data.type, data);
            // Envia para o MongoDB
            const watchc = this.mdb.mongoc.db(`thread_${thread}`);
            await watchc.collection(`WATCH`).insertOne(data);
        }
        catch (err) {
            result.message.code = 'BAD_GATEWAY';
            result.message.status = smartful_utils_1.HttpStatus.BAD_GATEWAY;
            result.message.errorMessage = err.message;
            result
                .setSuccess(false)
                .setMessage(result.message);
        }
        return result;
    }
    //#region CRUD
    async get(id) {
        let result = new smartful_data_1.ResultSet();
        try {
            this.qbd
                .select('m.*')
                .from(this.modelName, 'm')
                .where(['m.Id', '=', ':id'])
                .setStr('id', id);
            result = await this.qbd.resultSet();
        }
        catch (err) {
            result.message.status = smartful_utils_1.HttpStatus.BAD_REQUEST;
            result.message.errorMessage = err.message;
            result
                .setSuccess(false)
                .setMessage(result.message);
        }
        return result;
    }
    async insert(model) {
        let result = new smartful_data_1.ResultSet();
        try {
            this.preInsert(model);
            // A mágica acontece aqui;
            result = await this.qbd.doExecute(model, smartful_orm_1.TypeDML.DML_INSERT);
            const id = await this.qbd.proxy.lastId();
            model.setField('id', id);
            result
                .setStatus(smartful_utils_1.HttpStatus.CREATED)
                .setRows([model.data]);
            this.posInsert(model);
        }
        catch (err) {
            result.message.status = smartful_utils_1.HttpStatus.BAD_REQUEST;
            result.message.errorMessage = err.message;
            result
                .setSuccess(false)
                .setMessage(result.message);
        }
        return result;
    }
    ;
    async update(model) {
        let result = new smartful_data_1.ResultSet();
        try {
            this.preUpdate(model);
            // A mágica acontece aqui;
            result = await this.qbd.doExecute(model, smartful_orm_1.TypeDML.DML_UPDATE);
            result.setStatus(smartful_utils_1.HttpStatus.ACCEPTED);
            this.posUpdate(model);
        }
        catch (err) {
            result.message.status = smartful_utils_1.HttpStatus.BAD_REQUEST;
            result.message.errorMessage = err.message;
            result
                .setSuccess(false)
                .setMessage(result.message);
        }
        return result;
    }
    ;
    async delete(model) {
        let result = new smartful_data_1.ResultSet();
        try {
            this.preDelete(model);
            // A mágica acontece aqui;
            result = await this.qbd.doExecute(model, smartful_orm_1.TypeDML.DML_DELETE);
            result.setStatus(smartful_utils_1.HttpStatus.ACCEPTED);
            this.posDelete(model);
        }
        catch (err) {
            result.message.status = smartful_utils_1.HttpStatus.BAD_REQUEST;
            result.message.errorMessage = err.message;
            result
                .setSuccess(false)
                .setMessage(result.message);
        }
        return result;
    }
    ;
    //#endregion
    //#region EVENT
    async preInsert(model) { }
    async posInsert(model) { }
    async preUpdate(model) { }
    async posUpdate(model) { }
    async preDelete(model) { }
    async posDelete(model) { }
    //#endregion
    async getAccess(doaction) {
        const usercode = smartful_utils_1.tks.usercode;
        const menucode = this.annotation.Store.group;
        const doaccess = `EXEC up_UserAction '${usercode}', '${menucode}', '${doaction}'`;
        let expire = {};
        let today = (0, moment_1.default)();
        let result = new smartful_data_1.ResultSet();
        try {
            result = await this.qbd.query(doaccess).resultSet();
            if (result.records == 0) {
                result.message.status = smartful_utils_1.HttpStatus.FORBIDDEN;
                result.message.message = 'Sem permissão';
            }
            expire = result.first;
            if (expire.isactive == '0') {
                result.message.status = smartful_utils_1.HttpStatus.FORBIDDEN;
                result.message.message = 'Permissão desativada!';
            }
            let expireto = (0, moment_1.default)(expire.expireto);
            if (expireto < today) {
                result.message.status = smartful_utils_1.HttpStatus.FORBIDDEN;
                result.message.message = 'Permissão expirou!';
            }
            if (result.message.status != smartful_utils_1.HttpStatus.OK) {
                (0, smartful_data_1.notify)(result.message.message);
            }
        }
        catch (err) {
            result.message.status = smartful_utils_1.HttpStatus.BAD_REQUEST;
            result.message.message = err.message;
        }
        return result.message;
    }
}
exports.StoreBase = StoreBase;
