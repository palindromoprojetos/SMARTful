import { QueryBuilder } from "../smartful.orm";

export class Extension {

    constructor(private qbd: QueryBuilder) {}

    getEnum(args: string[]): string {
        const qbd: QueryBuilder = this.qbd.clone;

        let name: string = args[0];
        let code: string = args[1];
        let meta: string = args[2] != null ? ` as ${args[2]}` : '';

        const doRawName: boolean = /\w+\.\w+/.test(name);
        const doRawCode: boolean = /\w+\.\w+/.test(code);

        let sql: string = qbd.eq(
            qbd.select('eti.Description')
                .from('EnumTypeModel', 'et')
                .innerJoin('EnumTypeItemModel', 'eti', ['eti.EnumTypeId', '=', 'et.Id'])
                .where(['et.name', '=', ':name'])
                .andWhere(['eti.code', '=', ':code'])
                .setStr('name', name, doRawName)
                .setStr('code', code, doRawCode)
                .sql
        );

        return `${sql}${meta}`;
    }
    
}