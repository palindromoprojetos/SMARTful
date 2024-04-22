"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteBase = void 0;
const smartful_utils_1 = require("../../utils/smartful.utils");
class RouteBase {
    get annotation() {
        return smartful_utils_1.rmn.getMetaData(this.constructor.name);
    }
}
exports.RouteBase = RouteBase;
