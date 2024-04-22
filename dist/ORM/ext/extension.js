"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extension = void 0;
class Extension {
    constructor(qbd) {
        this.qbd = qbd;
    }
    getEnum(args) {
        const qbd = this.qbd.clone;
        let name = args[0];
        let code = args[1];
        let meta = args[2] != null ? ` as ${args[2]}` : '';
        const doRawName = /\w+\.\w+/.test(name);
        const doRawCode = /\w+\.\w+/.test(code);
        let sql = qbd.eq(qbd.select('eti.Description')
            .from('EnumTypeModel', 'et')
            .innerJoin('EnumTypeItemModel', 'eti', ['eti.EnumTypeId', '=', 'et.Id'])
            .where(['et.name', '=', ':name'])
            .andWhere(['eti.code', '=', ':code'])
            .setStr('name', name, doRawName)
            .setStr('code', code, doRawCode)
            .sql);
        return `${sql}${meta}`;
    }
}
exports.Extension = Extension;
