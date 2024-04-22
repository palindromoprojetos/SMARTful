"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mmn = exports.ModelManager = void 0;
const smartful_utils_1 = require("../smartful.utils");
const smartful_data_1 = require("../../data/smartful.data");
/**
 * Singleton
 */
class ModelManager {
    constructor(models = []) {
        ModelManager._models = models;
    }
    static create(models) {
        if (!ModelManager._instance) {
            ModelManager._instance = new ModelManager(models);
        }
        return ModelManager._instance;
    }
    static get models() {
        return ModelManager._models;
    }
    static getMetaData(className) {
        const info = [];
        if (className != undefined) {
            const modelClass = ModelManager._models.find((element) => element.name == className);
            const model = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.MODEL, modelClass);
            model.class = modelClass;
            const properties = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.PROPERTY, modelClass);
            return {
                Model: model,
                Properties: properties
            };
        }
        ModelManager._models.forEach((modelClass) => {
            const model = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.MODEL, modelClass);
            model.class = modelClass;
            const properties = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.PROPERTY, modelClass);
            info.push({
                Model: model,
                Properties: properties
            });
        });
        return info;
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
    static async logbook(model, type) {
        let resultSet = new smartful_data_1.ResultSet();
        if (model.annotation.Model.logbook) {
            const logbook = new smartful_utils_1.LocalLogbook(model, type);
            resultSet = await logbook.setLogTables();
        }
        return resultSet;
    }
}
exports.ModelManager = ModelManager;
ModelManager._models = [];
/**
 * Alias for ModelManager
 */
exports.mmn = ModelManager;
