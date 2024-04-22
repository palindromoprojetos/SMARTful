"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lmn = exports.LocalManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Singleton
 */
class LocalManager {
    constructor(locale, path) {
        LocalManager._locale = locale;
        LocalManager._path = path;
    }
    get path() {
        return LocalManager._path;
    }
    static getLocale(i18n) {
        const locale = LocalManager._locale.filter((item) => item[i18n]);
        let text = '{}';
        if (locale != null && locale.length != 0) {
            text = locale[0][i18n];
        }
        return text;
    }
    static setLocale(i18n, data) {
        const file = JSON.stringify(data, null, 4);
        const i18nPath = path.join(LocalManager._path, i18n);
        const filePath = `${i18nPath}\/resource.${i18n}.local.json`;
        if (!fs.existsSync(i18nPath)) {
            fs.mkdirSync(i18nPath);
        }
        fs.writeFile(filePath, file, 'utf8', LocalManager.i18nSaveError);
    }
    static i18nSaveError(err) {
        if (err) {
            console.log(`An error occured while writing Object to File.`);
            return console.log(err);
        }
        console.log(`File file has been saved.`);
    }
    static create(locale, path) {
        if (!LocalManager._instance) {
            LocalManager._instance = new LocalManager(locale, path);
        }
        return LocalManager._instance;
    }
}
exports.LocalManager = LocalManager;
LocalManager._locale = Array();
LocalManager._path = '';
/**
 * Alias for LocalManager
 */
exports.lmn = LocalManager;
