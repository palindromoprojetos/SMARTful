"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalLogbook = void 0;
const smartful_orm_1 = require("../../ORM/smartful.orm");
const smartful_data_1 = require("../../data/smartful.data");
const smartful_utils_1 = require("../smartful.utils");
class LocalLogbook {
    constructor(model, type) {
        this.model = model;
        this.type = type;
    }
    async setLogTables() {
        let result = new smartful_data_1.ResultSet();
        const logbookby = smartful_utils_1.tks.usercode;
        const qbd = smartful_orm_1.QueryBuilder.instance;
        const operation = smartful_orm_1.TypeDML[this.type].split('_')[1];
        const tablename = this.model.annotation.Model.table;
        const description = this.model.annotation.Model.description;
        qbd.query(LocalLogbook.tables)
            .setStr('tablename', tablename)
            .setStr('operation', operation)
            .setStr('logbookby', logbookby)
            .setStr('description', description);
        result = await qbd.resultSet();
        const tablesid = await qbd.proxy.lastId();
        const SQL_BULK = this.setLogFields(this.model, tablesid);
        if (SQL_BULK.length != 0) {
            await qbd.query(SQL_BULK.join('')).resultSet();
        }
        return result;
    }
    setLogFields(model, tablesid) {
        const sqlBulk = Array();
        const selfModel = Object.assign({}, model);
        const modifieds = model.modifieds;
        const properties = this.model.annotation.Properties;
        properties.forEach((item) => {
            if (item.meta.Column.logallow && modifieds.indexOf(item.name)) {
                let fieldname = item.name;
                let fielddata = selfModel[item.name] ?? '';
                let description = item.meta.Column.description ?? '';
                fielddata = fielddata.length == 0 ? 'NULL' : `'${fielddata}'`;
                description = description.length == 0 ? 'NULL' : `'${description}'`;
                sqlBulk.push(`
                        insert into
                            [log].[_Fields]
                            ( tablesid, fieldname, fielddata, description )
                        values
                            ( '${tablesid}', '${fieldname}', ${fielddata}, ${description} );`);
            }
        });
        return sqlBulk;
    }
}
exports.LocalLogbook = LocalLogbook;
LocalLogbook.tables = `
        insert into
            [log].[_Tables]
            ( tablename, operation, logbookby, description )
        values
            ( :tablename, :operation, :logbookby, :description );`;
