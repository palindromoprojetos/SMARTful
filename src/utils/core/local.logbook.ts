import { QueryBuilder, TypeDML } from "../../ORM/smartful.orm";
import { IModelBase, ResultSet } from "../../data/smartful.data";
import { tks } from "../smartful.utils";

export class LocalLogbook {

    private static tables: string = `
        insert into
            [log].[_Tables]
            ( tablename, operation, logbookby, description )
        values
            ( :tablename, :operation, :logbookby, :description );`;

    constructor(
        private model: IModelBase,
        private type: TypeDML
    ) { }

    async setLogTables(): Promise<ResultSet> {
        let result: ResultSet = new ResultSet();
        const logbookby: string = tks.usercode;
        const qbd: QueryBuilder = QueryBuilder.instance;
        const operation: string = TypeDML[this.type].split('_')[1];
        const tablename: string = this.model.annotation.Model.table;
        const description: string = this.model.annotation.Model.description;

        qbd.query(LocalLogbook.tables)
            .setStr('tablename', tablename)
            .setStr('operation', operation)
            .setStr('logbookby', logbookby)
            .setStr('description', description)

        result = await qbd.resultSet();

        const tablesid: string = await qbd.proxy.lastId();
        const SQL_BULK: Array<string> = this.setLogFields(this.model, tablesid);

        if(SQL_BULK.length != 0) {
            await qbd.query(SQL_BULK.join('')).resultSet();
        }

        return result;
    }

    private setLogFields(model: IModelBase, tablesid: string): Array<string> {
        const sqlBulk: Array<string> = Array<string>();
        const selfModel: any = Object.assign({}, model);
        const modifieds: Array<string> = model.modifieds;
        const properties: Array<any> = this.model.annotation.Properties;

        properties.forEach(
            (item: any) => {
                if(item.meta.Column.logallow && modifieds.indexOf(item.name)) {
                    let fieldname: string = item.name;
                    let fielddata: string = selfModel[item.name] ?? '';
                    let description: string = item.meta.Column.description ?? '';

                    fielddata = fielddata.length == 0 ? 'NULL' : `'${fielddata}'`;
                    description = description.length == 0 ? 'NULL' : `'${description}'`;

                    sqlBulk.push(`
                        insert into
                            [log].[_Fields]
                            ( tablesid, fieldname, fielddata, description )
                        values
                            ( '${tablesid}', '${fieldname}', ${fielddata}, ${description} );`);
                }
            }
        )

        return sqlBulk;
    } 

}

