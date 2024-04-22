"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
String.prototype.toAddPrefix = function (prefixStr) {
    return `${prefixStr}${this}`;
};
Array.prototype.toAddPostfix = function (postFixStr) {
    var _self = this;
    return _self.map(a => `${a}${postFixStr}`);
};
String.prototype.toAddPrefix = function (prefixStr) {
    return `${prefixStr}${this}`;
};
Number.prototype.thousandsSeperator = function () {
    return Number(this).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
Array.prototype.toAddPostfix = function (postFixStr) {
    var _self = this;
    return _self.map(a => `${a}${postFixStr}`);
};
Array.prototype.first = function () {
    return this.length != 0 ? this[0] : null;
};
