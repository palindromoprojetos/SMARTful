"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth2 = void 0;
//https://auth0.com/blog/pt-refresh-tokens-what-are-they-and-when-to-use-them/
var OAuth2;
(function (OAuth2) {
    OAuth2[OAuth2["none"] = 0] = "none";
    OAuth2[OAuth2["bearer"] = 1] = "bearer";
})(OAuth2 || (exports.OAuth2 = OAuth2 = {}));
