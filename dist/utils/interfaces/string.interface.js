"use strict";
String.prototype.StartsWith = function (searchTerm, ignoreCase = true) {
    let searchIn = this;
    if (ignoreCase) {
        searchTerm = searchTerm.toLocaleLowerCase();
        searchIn = searchIn.toLocaleLowerCase();
    }
    return searchIn.indexOf(searchTerm) === 0;
};
String.prototype.EndsWith = function (searchTerm, ignoreCase = true) {
    let searchIn = this;
    if (searchTerm.length > searchIn.length) {
        return false;
    }
    if (ignoreCase) {
        searchTerm = searchTerm.toLocaleLowerCase();
        searchIn = searchIn.toLocaleLowerCase();
    }
    const position = searchIn.length - searchTerm.length;
    const lastIndex = searchIn.indexOf(searchTerm, position);
    return lastIndex !== -1 && lastIndex === position;
};
String.prototype.Contains = function (searchTerm, ignoreCase = true) {
    let searchIn = this;
    if (ignoreCase) {
        searchTerm = searchTerm.toLocaleLowerCase();
        searchIn = searchIn.toLocaleLowerCase();
    }
    return searchIn.indexOf(searchTerm) >= 0;
};
String.prototype.IndexOf = function (searchTerm, ignoreCase = true) {
    let searchIn = this;
    if (ignoreCase) {
        searchTerm = searchTerm.toLocaleLowerCase();
        searchIn = searchIn.toLocaleLowerCase();
    }
    return searchIn.indexOf(searchTerm);
};
String.prototype.Insert = function (startIndex, valueToInsert) {
    const text = this;
    const first = text.substring(0, startIndex);
    const second = text.substring(startIndex, text.length);
    return first + valueToInsert + second;
};
String.prototype.Equals = function (value, ignoreCase) {
    let s = this.slice();
    if (ignoreCase) {
        s = s.toLocaleLowerCase();
        value = value.toLocaleLowerCase();
    }
    return value === s;
};
String.prototype.IsEmpty = function () {
    const s = this;
    return s.length < 1 || s.trim().length < 1;
};
