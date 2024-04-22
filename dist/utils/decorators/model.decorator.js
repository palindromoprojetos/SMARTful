"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Property = exports.Model = void 0;
const smartful_utils_1 = require("../smartful.utils");
const Model = (model) => {
    return (target) => {
        Reflect.defineMetadata(smartful_utils_1.MetaDataKeys.MODEL, model, target);
    };
};
exports.Model = Model;
const Property = (column) => {
    return (target, propertyKey) => {
        const modelClass = target.constructor;
        const properties = Reflect.hasMetadata(smartful_utils_1.MetaDataKeys.PROPERTY, modelClass) ?
            Reflect.getMetadata(smartful_utils_1.MetaDataKeys.PROPERTY, modelClass) : [];
        properties.push({
            name: propertyKey,
            meta: column
        });
        Reflect.defineMetadata(smartful_utils_1.MetaDataKeys.PROPERTY, properties, modelClass);
    };
};
exports.Property = Property;
