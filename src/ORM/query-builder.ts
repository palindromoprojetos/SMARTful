import { IModelBase, MessageError, ResultSet, TablePage, notify } from "../data/smartful.data";
import { Exp } from "./exp/exp";
import { Extension } from "./ext/extension";
import { HttpStatus, mmn } from "../utils/smartful.utils";
import { ProxyBuilder } from "./smartful.orm";

import moment from 'moment';

export enum TypeDML {
    DML_INSERT = 0,
    DML_SELECT = 1,
    DML_UPDATE = 2,
    DML_DELETE = 3,
}

export class QueryBuilder {
    private static _instance: QueryBuilder;

    private static _proxy: ProxyBuilder;

    private _exp: Exp;

    private _sql: string;

    private _ext: Extension;

    private aliasCode: number = 0;

    private aliasList: Array<any> = Array<any>();

    private _sqlInject = Array<string> (
        'UPDATE', 'DELETE', 'SELECT', 'INSERT', 'CREATE', 'TRUNCATE'
        ,'ALTER', 'DROP', 'TABLE', 'AND', 'OR', 'NOT', 'IN', 'EXISTS'
        ,'=', '!=', '<>', '>', '<', '>=', '<=', '(\d+)=(\d+)'
        ,'UNION', '\'', '\"', '\/\*', '\-\-', 'SET', 'LIKE'
        ,'INTO', 'SUBSTR', 'ASCII', 'LENGTH', 'HOST', 'HTTP', ';'
    )

    private constructor(private config: any = {}) {
        this._sql = '';
        this._exp = new Exp(this._sql);
        this._ext = new Extension(this);
    }

    static async create(config?: any): Promise<void> {
        if (!QueryBuilder._instance) {
            QueryBuilder._instance = new QueryBuilder(config);
            QueryBuilder._proxy = await ProxyBuilder.create(config);
        }
    }

    static get instance(): QueryBuilder {
        return QueryBuilder._instance;
    }

    get proxy(): ProxyBuilder {
        return QueryBuilder._proxy;
    }

    get exp(): Exp {
        return this._exp;
    }

    get ext(): Extension {
        return this._ext;
    }

    get sql(): string {
        const sql: string = this._sql;
        this._sql = '';

        return sql;
    }

    get clone(): QueryBuilder {
        return new QueryBuilder(this.config);
    }

    //#region Alias

    private newAlias(table: string, alias: string): string {
        const item: Array<any> = this.aliasList.filter((data: any) => data.alias == alias);

        if(item.length != 0) {
            return item.at(0).tuple;
        }

        this.aliasCode++;

        const tuple: string = `${alias}${this.aliasCode}`;

        this.aliasList.push({
            'table': table,
            'alias': alias,
            'tuple': tuple,
        });

        return tuple;
    }

    private setAlias(alias?: string) {

        if(alias != undefined) {
            const item: Array<any> = this.aliasList.filter((data: any) => data.alias == alias);
            if(item.length != 0) {
                const aliasName: string = item.at(0).tuple;
                const aliasCode: string = item.at(0).alias;
                const patternid: RegExp = new RegExp(`\\s+(?:\\(*)(${aliasName})\\.`,'gm');
                this._sql = this._sql.replace(patternid,
                    (match, group) => {
                        return group === aliasName ? match.replace(group, aliasCode) : match;
                    }
                );
            }
        }

        if(alias == undefined) {
            this.aliasList.forEach(
                (list: any) => {
                    const aliasCode: string = list.tuple;
                    const aliasName: string = list.alias;
                    const patternid: RegExp = new RegExp(`\\s+(?:\\(*)(${aliasName})\\.`,'gm');
                    this._sql = this._sql.replace(patternid,
                        (match, group) => {
                            return group === aliasName ? match.replace(group, aliasCode) : match;
                        }
                    );
                }
            );
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
    getEnum(args: string[]): string {
        return this._ext.getEnum(args);
    }
    //#endregion

    //#region Raw Expressions

    eq(args: any, alias?: string): string {
        return this._exp.eq(args, alias);
    }

    orX(args: any): string {
        return this._exp.orX(args);
    }

    andX(args: any): string {
        return this._exp.andX(args);
    }

    withCTE(args: any, alias?: string): QueryBuilder {
        this._sql = this._exp.withCTE(args, alias);

        this.setAlias(alias);

        return this;
    }

    //#endregion

    //#region Set params

    setInt(param: string, value: number): QueryBuilder {
        this._sql = this._sql.replaceAll(`:${param}`, `${value}`);

        return this;
    }

    setRaw(param: string, value: string): QueryBuilder {
        this._sql = this._sql.replaceAll(`:${param}`, `${value}`);

        return this;
    }

    setStr(param: string, value: string, doRaw: boolean = false) : QueryBuilder {
        if(doRaw == true) {
            return this.setRaw(param, value);
        }

        this._sql = this._sql.replaceAll(`:${param}`, `'${value}'`);

        return this;
    }

    //#endregion

    //#region Statement

    distinct(select: string): QueryBuilder {
        this.select(select);

        this._sql = this._sql.replaceAll('SELECT', 'SELECT DISTINCT');

        return this;
    }

    addSelect(fields: any): QueryBuilder {
        if(fields instanceof Array) {
            this._sql += "\n\t, " + fields.join("\n\t, ").trim();
        } else {
            this._sql += `\n\t, ${fields} `;
        }

        return this;
    }

    //#endregion

    //#region CRUD
    select(fields: any): QueryBuilder {
        if(fields instanceof Array) {
            this._sql += "SELECT\n\t" + fields.join("\n\t, ").trim();
        } else {
            this._sql += `SELECT\n\t${fields} `;
        }

        return this;
    }

    delete(model: IModelBase): QueryBuilder {
        const table: string = mmn.getMetaData(model.constructor.name).Model.table;

        this._sql += `DELETE FROM ${table} `;

        return this;
    }

    insert(model: string, field: any): QueryBuilder {
        const table: string = mmn.getMetaData(model).Model.table;

        this._sql += `INSERT INTO ${table} `;

        if(field instanceof Array) {
            const list: Array<string> = Array<string>();

            for (const name of field) {
                list.push(`:${name}`);
            }

            // field.forEach(name => list.push(`:${name}`));

            this._sql += "(\n\t" + field.join("\n\t, ").trim() + "\n)";
            this._sql += "\nVALUES (\n\t" + list.join("\n\t, ").trim() + "\n)";
        } else {
            this._sql += `( ${field} )\nVALUES ( :${field} )`;
        }
        
        return this;
    }

    update(model: string, field: any): QueryBuilder {
        const table: string = mmn.getMetaData(model).Model.table;

        this._sql += `UPDATE ${table}\n\tSET\n\t\t`;

        if(field instanceof Array) {
            const list: Array<string> = Array<string>();
            field.forEach(name => list.push(`${name} = :${name}`));
            this._sql += list.join("\n\t\t, ").trim();
        } else {
            this._sql += `${field} = :${field}`;
        }

        return this;
    }
    //#endregion

    //#region BIND

    private _bindSelect(model: IModelBase): QueryBuilder {

        this.select('m')
            .from(model.constructor.name, 'm')
            .where(['m.id', '=', ':id']);

        this._sql = this._bindValues(model, this._sql, TypeDML.DML_SELECT);

        return this;
    }

    private _bindInsert(model: IModelBase): QueryBuilder {
        const fields: Array<string> = Array<string>();

        for (const field of model.fields) {
            const property: any = model.annotation.Properties.find((item: any) => item['name'] == field);
            const column: any = property.meta.Column;
            const auto: boolean = column.strategy == 'AUTO';

            if((field != 'id' || field == 'id' && !auto) && (model.modifieds.indexOf(field) != -1)) {
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
            notify('self::NOT_MODIFIED_DATA')
        }

        this.insert(model.constructor.name, fields);

        this._sql = this._bindValues(model, this._sql, TypeDML.DML_INSERT);

        return this;
    }

    private _bindUpdate(model: IModelBase): QueryBuilder {
        const fields: Array<string> = Array<string>();

        model.fields.forEach(
            (field: string) => {
                if(field != 'id' && model.modifieds.indexOf(field) != -1) {
                    fields.push(field);
                }
            }
        );

        if (fields.length == 0) {
            throw Error('self::NOT_MODIFIED_DATA');
        }

        this.update(model.constructor.name, fields).where(['id', '=', ':id']);

        this._sql = this._bindValues(model, this._sql, TypeDML.DML_UPDATE);

        return this;
    }

    private _bindDelete(model: IModelBase): QueryBuilder {

        this.delete(model).where(['id', '=', ':id']);

        this._sql = this._bindValues(model, this._sql, TypeDML.DML_DELETE);

        return this;
    }

    private _bindValues(model: IModelBase, sql: string, type: TypeDML): string {
        const notate: any = model.annotation;
        const selfModel: any = Object.assign({}, model);

        for (const field of model.fields) {
            const property: any = notate.Properties.find((item: any) => item.name == field);
            const column: any = property.meta.Column;

            switch (type) {
                case TypeDML.DML_INSERT:
                    const auto: boolean = column.strategy == 'AUTO';
                    if((field != 'id' || field == 'id' && !auto) && (model.modifieds.indexOf(field) != -1)) {
                        const value: any = this._parseValue(selfModel[field], column.type);
                        sql = sql.replaceAll(`:${field}`, value);
                    }
                    break;
                case TypeDML.DML_UPDATE:
                    if(model.modifieds.indexOf(field) != -1) {
                        const value: any = this._parseValue(selfModel[field], column.type);
                        sql = sql.replaceAll(`:${field}`, value);
                    }                   
                    break;
                case TypeDML.DML_DELETE:
                    if(field == 'id') {
                        const value: any = this._parseValue(selfModel[field], column.type);
                        sql = sql.replaceAll(`:${field}`, value);
                    }                   
                    break;
                case TypeDML.DML_SELECT:
                    if(field == 'id') {
                        const value: any = this._parseValue(selfModel[field], column.type);
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

    private _parseValue(value: any, type: string): string {
        let parsed: string = '';
        let isDateValid = (value: string): boolean => {
            return new Date(value).toString() != 'Invalid Date';
        }

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
                if(isDateValid(value) == true) {
                    const date = new Date(value);
                    parsed = `'${moment(date).format("YYYY-MM-DD")}'`;
                }
                break;
            case 'datetime':
                parsed = 'null';
                if(isDateValid(value) == true) {
                    const date = new Date(value);
                    parsed = `'${moment(date).format("YYYY-MM-DDThh:mm:ss")}'`;
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

    from(from: string, alias: string): QueryBuilder {
        const table: string = mmn.getMetaData(from).Model.table;
        const aliasCode: string = this.newAlias(from, alias);

        this._sql += `\nFROM\n\t${table} ${aliasCode}`;

        this.setAlias(alias);

        return this;
    }

    private join(join: string, alias: string, condition: Array<any>) {
        // const list: Array<string> = Array<string>();
        // const tuple: Array<string> = Array<string>();
        // const regex = new RegExp('[A-Za-z0-9\\-\\_]+\\.\\*', 'gm');
        const table: string = mmn.getMetaData(join).Model.table;
        const aliasCode: string = this.newAlias(join, alias);

        // mmn.getMetaData(join).Properties.forEach((item: any) => tuple.push(item.name));
        // tuple.forEach(field => list.push(`${aliasCode}.${field}`));
        // const fieldList: string = list.join("\n\t, ").trim();

        if(condition.length > 3) {
            this._sql += `\n\tJOIN ${table} ${aliasCode} on (\n`;
            this._sql += "\t\t" + ((condition instanceof Array) ? condition.join(" ").trim() : condition);
            this._sql += "\n\t)";
        } else {
            this._sql += `\n\tJOIN ${table} ${aliasCode} on (`;
            this._sql += (condition instanceof Array) ? condition.join(" ").trim() : condition;
            this._sql += ")";
        }

        this.setAlias(alias);

        // this._sql = this._sql.replace(regex, fieldList);
    }

    leftJoin(join: string, alias: string, condition: Array<any>): QueryBuilder {
        this.join(join, alias, condition);

        this._sql = this._sql.replaceAll('\tJOIN', '\tLEFT JOIN');

        return this;
    }

    rightJoin(join: string, alias: string, condition: Array<any>): QueryBuilder {
        this.join(join, alias, condition);

        this._sql = this._sql.replaceAll('\tJOIN', '\tRIGHT JOIN');

        return this;
    }

    innerJoin(join: string, alias: string, condition: Array<any>): QueryBuilder {
        this.join(join, alias, condition);
        
        this._sql = this._sql.replaceAll('\tJOIN', '\tINNER JOIN');

        return this;
    }

    crossApply(join: string, alias: string, condition: any): QueryBuilder {

        // throw Error('crossApply: Not implemented yet!');

        return this;
    }

    where(where: any): QueryBuilder {
        let args: Array<any> = [];

        if(arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\nWHERE\n\t  " + args.join("\n  AND ").trim()
        } else if(where instanceof Array) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\nWHERE " + args[0].join(" ").trim();
        } else {
            this._sql += `\nWHERE ${where} `;
        }

        this.setAlias();

        return this;
    }

    andWhere(where: any) : QueryBuilder {
        let args: Array<any> = [];

        if(arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\n  AND " + args.join("\n  AND ").trim()
        } else if(where instanceof Array) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\n  AND " + args[0].join(" ").trim();
        } else {
            this._sql += `\n  AND ${where} `;
        }

		this.setAlias();

        return this;
    }

    orWhere(where: any) : QueryBuilder {
        let args: Array<any> = [];

        if(arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\n  OR " + args.join("\n  OR ").trim()
        } else if(where instanceof Array) {
            for (let i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            this._sql += "\n  OR " + args[0].join(" ").trim();
        } else {
            this._sql += `\n  OR ${where} `;
        }

		this.setAlias();

        return this;
    }

    union() : QueryBuilder {
        this._sql += "\nUNION\n";

        return this;
    }

    unionAll(): QueryBuilder {
        this.union();

        this._sql.replaceAll('UNION', 'UNION ALL');

        return this;
    }

    groupBy(groupBy: string): QueryBuilder {
        this._sql += `\nGROUP BY\n\t${groupBy}`;
		
		this.setAlias();
		
        return this;
    }

    addGroupBy(groupBy: any): QueryBuilder {
        if(groupBy instanceof Array) {
            this._sql += "\n\t, " + groupBy.join(", ").trim();
        } else {
            this._sql += `\n\t, ${groupBy}`;
        }

		this.setAlias();

        return this;
    }

    having(having: any): QueryBuilder {
        // throw Error('having: Not implemented yet!');
		this.setAlias();
        return this;
    }

    andHaving(having: any): QueryBuilder {
        // throw Error('andHaving: Not implemented yet!');
		this.setAlias();
        return this;
    }

    orHaving(having: any): QueryBuilder {
        // throw Error('orHaving: Not implemented yet!');
		this.setAlias();
        return this;
    }

    orderBy(sort: string, order?: string): QueryBuilder {
        this._sql += `\nORDER BY\n\t${sort} ${order ?? ''}`;
		
		this.setAlias();

        return this;
    }

    addOrderBy(sort: string, order?: string): QueryBuilder {
        this._sql += `\n\t, ${sort} ${order ?? '' }`;
		
        this.setAlias();

        return this;
    }

    //#endregion

    //#region Execute

    query(sql: string): QueryBuilder {
        this._sql = sql;

        return this;
    }

    async transaction(): Promise<void> {
        await this.proxy.transaction();
    }

    async commit(): Promise<void> {
        await this.proxy.commit();
    }

    async rollback(): Promise<void> {
        await this.proxy.rollback();
    }

    async execute(): Promise<ResultSet> {
        let result: ResultSet = new ResultSet();

        try {

            result = await this.proxy.query(this._sql);

        } catch (err: any) {
            const message: MessageError = new MessageError();
            message.status = HttpStatus.BAD_REQUEST;
            message.errorMessage = err.message;

            result
                .setSuccess(false)
                .setMessage(message);
        }

        this._sql = '';
        this.aliasCode = 0;
        this.aliasList = Array<any>();

        return result;
    }

    async doExecute(model: IModelBase, type: TypeDML): Promise<ResultSet> {
        let result: ResultSet = new ResultSet();

        switch (type) {
            case TypeDML.DML_INSERT:
                result = await this._bindInsert(model).proxy.query(this._sql);
                await mmn.logbook(model, type);
                break;
            case TypeDML.DML_DELETE:
                await mmn.logbook(model, type);
                result = await this._bindDelete(model).proxy.query(this._sql);
                break;
            case TypeDML.DML_UPDATE:
                result = await this._bindUpdate(model).proxy.query(this._sql);
                await mmn.logbook(model, type);
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
    async resultSet(page?: TablePage): Promise<ResultSet> {
        let result: ResultSet = new ResultSet();
        let start: number = page instanceof TablePage ? page.start : 0;
        let limit: number = page instanceof TablePage ? page.limit : 20;

        try {
            if(page instanceof TablePage) {
                start *= limit;
                this._sql = this._sql.replace(new RegExp('FROM(?!.*FROM)', 's'),"\t, FOUND_ROWS = COUNT(*) OVER()\nFROM");
                this._sql += "\nOFFSET :start ROWS FETCH NEXT :limit ROWS ONLY;";

                this.setInt('start', start);
                this.setInt('limit', limit);
            }

            result = await this.proxy.query(this._sql);

            if(page instanceof TablePage) {
                const rows: Array<any> = result.rows;
                const record: number = (rows.length != 0) ? rows[0].found_rows : 0;

                rows.forEach((item: any) => delete item.found_rows);

				result
					.setRows(rows)
                    .setPaging(record, limit);
			}

            if(result.records == 0) {
                result.setText(ResultSet.EMPTY_RESULT);                
            }

        } catch (err: any) {
            const message: MessageError = new MessageError();
            message.status = HttpStatus.BAD_REQUEST;
            message.errorMessage = err.message;

            result
                .setSuccess(false)
                .setMessage(message);
        }

        this._sql = '';
        this.aliasCode = 0;
        this.aliasList = Array<any>();

        return result;
    }

    //#endregion

}
