"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = exports.TypeDML = void 0;
const smartful_data_1 = require("../data/smartful.data");
const exp_1 = require("./exp/exp");
const extension_1 = require("./ext/extension");
const smartful_utils_1 = require("../utils/smartful.utils");
const smartful_orm_1 = require("./smartful.orm");
const moment_1 = __importDefault(require("moment"));
var TypeDML;
(function (TypeDML) {
    TypeDML[TypeDML["DML_INSERT"] = 0] = "DML_INSERT";
    TypeDML[TypeDML["DML_SELECT"] = 1] = "DML_SELECT";
    TypeDML[TypeDML["DML_UPDATE"] = 2] = "DML_UPDATE";
    TypeDML[TypeDML["DML_DELETE"] = 3] = "DML_DELETE";
})(TypeDML || (exports.TypeDML = TypeDML = {}));
class QueryBuilder {
    constructor(config = {}) {
        this.config = config;
        this.aliasCode = 0;
        this.aliasList = Array();
        this._sqlInject = Array('UPDATE', 'DELETE', 'SELECT', 'INSERT', 'CREATE', 'TRUNCATE', 'ALTER', 'DROP', 'TABLE', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', '=', '!=', '<>', '>', '<', '>=', '<=', '(\d+)=(\d+)', 'UNION', '\'', '\"', '\/\*', '\-\-', 'SET', 'LIKE', 'INTO', 'SUBSTR', 'ASCII', 'LENGTH', 'HOST', 'HTTP', ';');
        this._sql = '';
        this._exp = new exp_1.Exp(this._sql);
        this._ext = new extension_1.Extension(this);
    }
    static async create(config) {
        if (!QueryBuilder._instance) {
            QueryBuilder._instance = new QueryBuilder(config);
            QueryBuilder._proxy = await smartful_orm_1.ProxyBuilder.create(config);
        }
    }
    static get instance() {
        return QueryBuilder._instance;
    }
    get proxy() {
        return QueryBuilder._proxy;
    }
    get exp() {
        return this._exp;
    }
    get ext() {
        return this._ext;
    }
    get sql() {
        const sql = this._sql;
        this._sql = '';
        return sql;
    }
    get clone() {
        return new QueryBuilder(this.config);
    }
    //#region Alias
    newAlias(table, alias) {
        const item = this.aliasList.filter((data) => data.alias == alias);
        if (item.length != 0) {
            return item.at(0).tuple;
        }
        this.aliasCode++;
        const tuple = `${alias}${this.aliasCode}`;
        this.aliasList.push({
            'table': table,
            'alias': alias,
            'tuple': tuple,
        });
        return tuple;
    }
    setAlias(alias) {
        if (alias != undefined) {
            const item = this.aliasList.filter((data) => data.alias == alias);
            if (item.length != 0) {
                const aliasName = item.at(0).tuple;
                const aliasCode = item.at(0).alias;
                const patternid = new RegExp(`\\s+(?:\\(*)(${aliasName})\\.`, 'gm');
                this._sql = this._sql.replace(patternid, (match, group) => {
                    return group === aliasName ? match.replace(group, aliasCode) : match;
                });
            }
        }
        if (alias == undefined) {
            this.aliasList.forEach((list) => {
                const aliasCode = list.tuple;
                const aliasName = list.alias;
                const patternid = new RegExp(`\\s+(?:\\(*)(${aliasName})\\.`, 'gm');
                this._sql = this._sql.replace(patternid, (match, group) => {
                    return group === aliasName ? match.replace(group, aliasCode) : match;
                });
            });
        }
        // this.aliasList.forEach(
        //     (list: any) => {
        //         if(list.alias == alias) {
        //             const aliasCode: string = list.tuple;
        //             const aliasName: string = list.alias;
        //             const patternid: RegExp = new RegExp(`\\s+(?:\\(*)(${aliasName})\\.`,'gm');
        //             this._sql = this._sql.replace(patternid,
        //                 (match, group) => {
        //                     return group === aliasName ? match.replace(group,aliasCode) : match;
        //                 }
        //             );
        //         }
        //         if(alias == undefined) {
        //             const aliasCode: string = list.tuple;
        //             const aliasName: string = list.alias;
        //             const patternid: RegExp = new RegExp(`\\s+(?:\\(*)(${aliasName})\\.`,'gm');
        //             this._sql = this._sql.replace(patternid,
        //                 (match, group) => {
        //                     return group === aliasName ? match.replace(group,aliasCode) : match;
        //                 }
        //             );
        //         }
        //     }
        // );
    }
    //#endregion
    //#region Extension
    getEnum(args) {
        return this._ext.getEnum(args);
    }
    //#endregion
    //#region Raw Expressions
    eq(args, alias) {
        return this._exp.eq(args, alias);
    }
    orX(args) {
        return this._exp.orX(args);
    }
    andX(args) {
        return this._exp.andX(args);
    }
    withCTE(args, alias) {
        this._sql = this._exp.withCTE(args, alias);
        this.setAlias(alias);
        return this;
    }
    //#endregion
    //#region Set params
    setInt(param, value) {
        this._sql = this._sql.replaceAll(`:${param}`, `${value}`);
        return this;
    }
    setRaw(param, value) {
        this._sql = this._sql.replaceAll(`:${param}`, `${value}`);
        return this;
    }
    setStr(param, value, doRaw = false) {
        if (doRaw == true) {
            return this.setRaw(param, value);
        }
        this._sql = this._sql.replaceAll(`:${param}`, `'${value}'`);
        return this;
    }
    //#endregion
    //#region Statement
    distinct(select) {
        this.select(select);
        this._sql = this._sql.replaceAll('SELECT', 'SELECT DISTINCT');
        return this;
    }
    addSelect(fields) {
        if (fields instanceof Array) {
            this._sql += "\n\t, " + fields.join("\n\t, ").trim();
        }
        else {
            this._sql += `\n\t, ${fields} `;
        }
        return this;
    }
    //#endregion
    //#region CRUD
    select(fields) {
        if (fields instanceof Array) {
            this._sql += "SELECT\n\t" + fields.join("\n\t, ").trim();
        }
        else {
            this._sql += `SELECT\n\t${fields} `;
        }
        return this;
    }
    delete(model) {
        const table = smartful_utils_1.mmn.getMetaData(model.constructor.name).Model.table;
        this._sql += `DELETE FROM ${table} `;
        return this;
    }
    insert(model, field) {
        const table = smartful_utils_1.mmn.getMetaData(model).Model.table;
        this._sql += `INSERT INTO ${table} `;
        if (field instanceof Array) {
            const list = Array();
            for (const name of field) {
                list.push(`:${name}`);
            }
            // field.forEach(name => list.push(`:${name}`));
            this._sql += "(\n\t" + field.join("\n\t, ").trim() + "\n)";
            this._sql += "\nVALUES (\n\t" + list.join("\n\t, ").trim() + "\n)";
        }
        else {
            this._sql += `( ${field} )\nVALUES ( :${field} )`;
        }
        return this;
    }
    update(model, field) {
        const table = smartful_utils_1.mmn.getMetaData(model).Model.table;
        this._sql += `UPDATE ${table}\n\tSET\n\t\t`;
        if (field instanceof Array) {
            const list = Array();
            field.forEach(name => list.push(`${name} = :${name}`));
            this._sql += list.join("\n\t\t, ").trim();
        }
        else {
            this._sql += `${field} = :${field}`;
        }
        return this;
    }
    //#endregion
    //#region BIND
    _bindSelect(model) {
        this.select('m')
            .from(model.constructor.name, 'm')
            .where(['m.id', '=', ':id']);
        this._sql = this._bindValues(model, this._sql, TypeDML.DML_SELECT);
        return this;
    }
    _bindInsert(model) {
        const fields = Array();
        for (const field of model.fields) {
            const property = model.annotation.Properties.find((item) => item['name'] == field);
            const column = property.meta.Column;
            const auto = column.strategy == 'AUTO';
            if ((field != 'id' || field == 'id' && !auto) && (model.modifieds.indexOf(field) != -1)) {
                fields.push(field);
            }
        }
        // model.fields.forEach(
        //     (field: string) => {
        //         const property: any = model.annotation.Properties.find((item: any) => item['name'] == field);
        //         const column: any = property.meta.Column;
        //         const auto: boolean = column.strategy == 'AUTO';
        //         if((field != 'id' || field == 'id' && !auto) && (model.modifieds.indexOf(field) != -1)) {
        //             fields.push(field);
        //         }
        //     }
        // );
        if (fields.length == 0) {
            (0, smartful_data_1.notify)('self::NOT_MODIFIED_DATA');
        }
        this.insert(model.constructor.name, fields);
        this._sql = this._bindValues(model, this._sql, TypeDML.DML_INSERT);
        return this;
    }
    _bindUpdate(model) {
        const fields = Array();
        model.fields.forEach((field) => {
            if (field != 'id' && model.modifieds.indexOf(field) != -1) {
                fields.push(field);
            }
        });
        if (fields.length == 0) {
            throw Error('self::NOT_MODIFIED_DATA');
        }
        this.update(model.constructor.name, fields).where(['id', '=', ':id']);
        this._sql = this._bindValues(model, this._sql, TypeDML.DML_UPDATE);
        return this;
    }
    _bindDelete(model) {
        this.delete(model).where(['id', '=', ':id']);
        this._sql = this._bindValues(model, this._sql, TypeDML.DML_DELETE);
        return this;
    }
    _bindValues(model, sql, type) {
        const notate = model.annotation;
        const selfModel = Object.assign({}, model);
        for (const field of model.fields) {
            const property = notate.Properties.find((item) => item.name == field);
            const column = property.meta.Column;
            switch (type) {
                case TypeDML.DML_INSERT:
                    const auto = column.strategy == 'AUTO';
                    if ((field != 'id' || field == 'id' && !auto) && (model.modifieds.indexOf(field) != -1)) {
                        const value = this._parseValue(selfModel[field], column.type);
                        sql = sql.replaceAll(`:${field}`, value);
                    }
                    break;
                case TypeDML.DML_UPDATE:
                    if (model.modifieds.indexOf(field) != -1) {
                        const value = this._parseValue(selfModel[field], column.type);
                        sql = sql.replaceAll(`:${field}`, value);
                    }
                    break;
                case TypeDML.DML_DELETE:
                    if (field == 'id') {
                        const value = this._parseValue(selfModel[field], column.type);
                        sql = sql.replaceAll(`:${field}`, value);
                    }
                    break;
                case TypeDML.DML_SELECT:
                    if (field == 'id') {
                        const value = this._parseValue(selfModel[field], column.type);
                        sql = sql.replaceAll(`:${field}`, value);
                    }
                    break;
            }
        }
        // model.fields.forEach(
        //     (field: string) => {
        //         const property: any = notate.Properties.find((item: any) => item.name == field);
        //         const column: any = property.meta.Column;
        //         switch (type) {
        //             case TypeDML.DML_INSERT:
        //                 const auto: boolean = column.strategy == 'AUTO';
        //                 if((field != 'id' || field == 'id' && !auto) && (model.modifieds.indexOf(field) != -1)) {
        //                     const value: any = this._parseValue(selfModel[field], column.type);
        //                     sql = sql.replaceAll(`:${field}`, value);
        //                 }
        //                 break;
        //             case TypeDML.DML_UPDATE:
        //                 if(model.modifieds.indexOf(field) != -1) {
        //                     const value: any = this._parseValue(selfModel[field], column.type);
        //                     sql = sql.replaceAll(`:${field}`, value);
        //                 }                   
        //                 break;
        //             case TypeDML.DML_DELETE:
        //                 if(field == 'id') {
        //                     const value: any = this._parseValue(selfModel[field], column.type);
        //                     sql = sql.replaceAll(`:${field}`, value);
        //                 }                   
        //                 break;
        //             case TypeDML.DML_SELECT:
        //                 if(field == 'id') {
        //                     const value: any = this._parseValue(selfModel[field], column.type);
        //                     sql = sql.replaceAll(`:${field}`, value);
        //                 }                   
        //                 break;
        //         }
        //     }
        // );
        return sql;
    }
    _parseValue(value, type) {
        let parsed = '';
        let isDateValid = (value) => {
            return new Date(value).toString() != 'Invalid Date';
        };
        switch (type) {
            case 'string':
                parsed = value != null ? `'${value}'` : 'null';
                break;
            case 'number':
                const n = parseInt(value, 10);
                parsed = isNaN(n) ? 'null' : value;
                break;
            case 'date':
                parsed = 'null';
                if (isDateValid(value) == true) {
                    const date = new Date(value);
                    parsed = `'${(0, moment_1.default)(date).format("YYYY-MM-DD")}'`;
                }
                break;
            case 'datetime':
                parsed = 'null';
                if (isDateValid(value) == true) {
                    const date = new Date(value);
                    parsed = `'${(0, moment_1.default)(date).format("YYYY-MM-DDThh:mm:ss")}'`;
                }
                break;
            default:
                parsed = value;
                break;
        }
        return parsed;
    }
    //#endregion
    //#region ORM
    from(from, alias) {
        const table = smartful_utils_1.mmn.getMetaData(from).Model.table;
        const aliasCode = this.newAlias(from, alias);
        this._sql += `\nFROM\n\t${table} ${aliasCode}`;
        this.setAlias(alias);
        return this;
    }
    join(join, alias, condition) {
        // const list: Array<string> = Array<string>();
        // const tuple: Array<string> = Array<string>();
        // const regex = new RegExp('[A-Za-z0-9\\-\\_]+\\.\\*', 'gm');
        const table = smartful_utils_1.mmn.getMetaData(join).Model.table;
        const aliasCode = this.newAlias(join, alias);
        // mmn.getMetaData(join).Properties.forEach((item: any) => tuple.push(item.name));
        // tuple.forEach(field => list.push(`${aliasCode}.${field}`));
        // const fieldList: string = list.join("\n\t, ").trim();
        if (condition.length > 3) {
            this._sql += `\n\tJOIN ${table} ${aliasCode} on (\n`;
            this._sql += "\t\t" + ((condition instanceof Array) ? condition.join(" ").trim() : condition);
            this._sql += "\n\t)";
        }
        else {
            this._sql += `\n\tJOIN ${table} ${aliasCode} on (`;
            this._sql += (condition instanceof Array) ? condition.join(" ").trim() : condition;
            this._sql += ")";
        }
        this.setAlias(alias);
        // this._sql = this._sql.replace(regex, fieldList);
    }
    leftJoin(join, alias, condition) {
        this.join(join, alias, condition);
        this._sql = this._sql.replaceAll('\tJOIN', '\tLEFT JOIN');
        return this;
    }
    rightJoin(join, alias, condition) {
        this.join(join, alias, condition);
        this._sql = this._sql.replaceAll('\tJOIN', '\tRIGHT JOIN');
        return this;
    }
    innerJoin(join, alias, condition) {
        this.join(join, alias, condition);
        this._sql = this._sql.replaceAll('\tJOIN', '\tINNER JOIN');
        return this;
    }
    crossApply(join, alias, condition) {
        // throw Error('crossApply: Not implemented yet!');
        return this;
    }
    where(where) {
        let args = [];
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\nWHERE\n\t  " + args.join("\n  AND ").trim();
        }
        else if (where instanceof Array) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\nWHERE " + args[0].join(" ").trim();
        }
        else {
            this._sql += `\nWHERE ${where} `;
        }
        this.setAlias();
        return this;
    }
    andWhere(where) {
        let args = [];
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\n  AND " + args.join("\n  AND ").trim();
        }
        else if (where instanceof Array) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\n  AND " + args[0].join(" ").trim();
        }
        else {
            this._sql += `\n  AND ${where} `;
        }
        this.setAlias();
        return this;
    }
    orWhere(where) {
        let args = [];
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\n  OR " + args.join("\n  OR ").trim();
        }
        else if (where instanceof Array) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\n  OR " + args[0].join(" ").trim();
        }
        else {
            this._sql += `\n  OR ${where} `;
        }
        this.setAlias();
        return this;
    }
    union() {
        this._sql += "\nUNION\n";
        return this;
    }
    unionAll() {
        this.union();
        this._sql.replaceAll('UNION', 'UNION ALL');
        return this;
    }
    groupBy(groupBy) {
        this._sql += `\nGROUP BY\n\t${groupBy}`;
        this.setAlias();
        return this;
    }
    addGroupBy(groupBy) {
        if (groupBy instanceof Array) {
            this._sql += "\n\t, " + groupBy.join(", ").trim();
        }
        else {
            this._sql += `\n\t, ${groupBy}`;
        }
        this.setAlias();
        return this;
    }
    having(having) {
        // throw Error('having: Not implemented yet!');
        this.setAlias();
        return this;
    }
    andHaving(having) {
        // throw Error('andHaving: Not implemented yet!');
        this.setAlias();
        return this;
    }
    orHaving(having) {
        // throw Error('orHaving: Not implemented yet!');
        this.setAlias();
        return this;
    }
    orderBy(sort, order) {
        this._sql += `\nORDER BY\n\t${sort} ${order ?? ''}`;
        this.setAlias();
        return this;
    }
    addOrderBy(sort, order) {
        this._sql += `\n\t, ${sort} ${order ?? ''}`;
        this.setAlias();
        return this;
    }
    //#endregion
    //#region Execute
    query(sql) {
        this._sql = sql;
        return this;
    }
    async transaction() {
        await this.proxy.transaction();
    }
    async commit() {
        await this.proxy.commit();
    }
    async rollback() {
        await this.proxy.rollback();
    }
    async execute() {
        let result = new smartful_data_1.ResultSet();
        try {
            result = await this.proxy.query(this._sql);
        }
        catch (err) {
            const message = new smartful_data_1.MessageError();
            message.status = smartful_utils_1.HttpStatus.BAD_REQUEST;
            message.errorMessage = err.message;
            result
                .setSuccess(false)
                .setMessage(message);
        }
        this._sql = '';
        this.aliasCode = 0;
        this.aliasList = Array();
        return result;
    }
    async doExecute(model, type) {
        let result = new smartful_data_1.ResultSet();
        switch (type) {
            case TypeDML.DML_INSERT:
                result = await this._bindInsert(model).proxy.query(this._sql);
                await smartful_utils_1.mmn.logbook(model, type);
                break;
            case TypeDML.DML_DELETE:
                await smartful_utils_1.mmn.logbook(model, type);
                result = await this._bindDelete(model).proxy.query(this._sql);
                break;
            case TypeDML.DML_UPDATE:
                result = await this._bindUpdate(model).proxy.query(this._sql);
                await smartful_utils_1.mmn.logbook(model, type);
                break;
            case TypeDML.DML_SELECT:
                result = await this._bindSelect(model).proxy.query(this._sql);
                break;
        }
        this._sql = '';
        return result;
    }
    /**
     * ResultSet of Statement requested
     * @param page Is optinal, but if you use TablePage, always use OrderBy clause into statement
     * @returns Promise<ResultSet>
     */
    async resultSet(page) {
        let result = new smartful_data_1.ResultSet();
        let start = page instanceof smartful_data_1.TablePage ? page.start : 0;
        let limit = page instanceof smartful_data_1.TablePage ? page.limit : 20;
        try {
            if (page instanceof smartful_data_1.TablePage) {
                start *= limit;
                this._sql = this._sql.replace(new RegExp('FROM(?!.*FROM)', 's'), "\t, FOUND_ROWS = COUNT(*) OVER()\nFROM");
                this._sql += "\nOFFSET :start ROWS FETCH NEXT :limit ROWS ONLY;";
                this.setInt('start', start);
                this.setInt('limit', limit);
            }
            result = await this.proxy.query(this._sql);
            if (page instanceof smartful_data_1.TablePage) {
                const rows = result.rows;
                const record = (rows.length != 0) ? rows[0].found_rows : 0;
                rows.forEach((item) => delete item.found_rows);
                result
                    .setRows(rows)
                    .setPaging(record, limit);
            }
            if (result.records == 0) {
                result.setText(smartful_data_1.ResultSet.EMPTY_RESULT);
            }
        }
        catch (err) {
            const message = new smartful_data_1.MessageError();
            message.status = smartful_utils_1.HttpStatus.BAD_REQUEST;
            message.errorMessage = err.message;
            result
                .setSuccess(false)
                .setMessage(message);
        }
        this._sql = '';
        this.aliasCode = 0;
        this.aliasList = Array();
        return result;
    }
}
exports.QueryBuilder = QueryBuilder;
