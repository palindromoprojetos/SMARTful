"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const smartful_utils_1 = require("../smartful.utils");
const Store = (store) => {
    return (target) => {
        Reflect.defineMetadata(smartful_utils_1.MetaDataKeys.STORE, store, target);
    };
};
exports.Store = Store;
