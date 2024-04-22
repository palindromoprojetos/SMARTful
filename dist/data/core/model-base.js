"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelBase = void 0;
const smartful_utils_1 = require("../../utils/smartful.utils");
class ModelBase {
    constructor() {
        this.id = '';
        this._modifieds = Array();
    }
    get annotation() {
        return smartful_utils_1.mmn.getMetaData(this.constructor.name);
    }
    get data() {
        const data = [];
        const self = this;
        this.annotation.Properties.forEach((meta) => {
            data[meta.name] = self[meta.name];
        });
        return data;
    }
    get json() {
        return JSON.stringify(this.data);
    }
    get fields() {
        const tupla = Array();
        this.annotation.Properties.forEach((item) => tupla.push(item.name));
        return tupla;
    }
    get modifieds() {
        return this._modifieds;
    }
    setField(field, value) {
        const self = this;
        self[field] = value;
        this._modifieds.push(field);
    }
    setModified(field) {
        this._modifieds.push(field);
    }
    removeEmpty() {
        const self = this;
        const data = this.data;
        for (let field in data) {
            const value = data[field];
            if (field != 'id' && (value == undefined || value.length == 0)) {
                delete self.field;
            }
        }
    }
    static hydrate(constr, data, ...args) {
        const model = new constr(...args);
        for (let field in data) {
            if (model.hasOwnProperty(field)) {
                model['setField'](field, data[field]);
            }
        }
        return model;
    }
}
exports.ModelBase = ModelBase;
