"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpDelete = exports.HttpPost = exports.HttpPut = exports.HttpGet = exports.Prefix = void 0;
const smartful_utils_1 = require("../smartful.utils");
const Prefix = (prefix) => {
    return (target) => {
        Reflect.defineMetadata(smartful_utils_1.MetaDataKeys.PREFIX, prefix, target);
    };
};
exports.Prefix = Prefix;
const factory = (method) => {
    return (path = '', auth = smartful_utils_1.OAuth2.bearer) => {
        return (target, propertyKey) => {
            let isStatic = (typeof target === 'function');
            const routeClass = isStatic ? target : target.constructor;
            const suffix = Reflect.hasMetadata(smartful_utils_1.MetaDataKeys.SUFFIX, routeClass) ?
                Reflect.getMetadata(smartful_utils_1.MetaDataKeys.SUFFIX, routeClass) : [];
            suffix.push({
                path,
                auth,
                method,
                handle: propertyKey
            });
            Reflect.defineMetadata(smartful_utils_1.MetaDataKeys.SUFFIX, suffix, routeClass);
        };
    };
};
exports.HttpGet = factory(smartful_utils_1.HttpVerbKeys.GET);
exports.HttpPut = factory(smartful_utils_1.HttpVerbKeys.PUT);
exports.HttpPost = factory(smartful_utils_1.HttpVerbKeys.POST);
exports.HttpDelete = factory(smartful_utils_1.HttpVerbKeys.DELETE);
