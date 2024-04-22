"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tks = exports.TokenSession = void 0;
class TokenSession {
    constructor(paylod) {
        TokenSession._paylod = paylod;
    }
    static create(paylod, bearer) {
        if (!TokenSession._instance) {
            TokenSession._bearer = bearer;
            TokenSession._instance = new TokenSession(paylod);
        }
        return TokenSession._instance;
    }
    static get bearer() {
        return TokenSession._bearer ?? '';
    }
    static get paylod() {
        return TokenSession._paylod;
    }
    static get usercode() {
        return TokenSession._paylod.usercode;
    }
    static get username() {
        return TokenSession._paylod.username;
    }
    static get langcode() {
        return TokenSession._paylod.langcode;
    }
}
exports.TokenSession = TokenSession;
exports.tks = TokenSession;
