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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const smartful_orm_1 = require("./ORM/smartful.orm");
const smartful_utils_1 = require("./utils/smartful.utils");
const http_server_1 = require("./utils/core/http.server");
require("./utils/core/http.socket");
require("./utils/core/http.config");
/**
 * WebApi
 * Singleton class
 */
class WebApi {
    constructor(config) {
        WebApi._app = http_server_1.app;
        WebApi._basePath = config.setting.basePath;
        http_server_1.serverHttp.listen(config.setting.listener);
    }
    /**
     * Picard says "engage", to start api
     */
    engage() {
        WebApi._app.use(WebApi._basePath, smartful_utils_1.RouteManager.router, smartful_utils_1.RouteManager.invalidRoute);
    }
    static async create(config) {
        const build = config.build;
        const base = `${__dirname}/\../\api`;
        const dtbSchema = config[build].dtbSchema;
        if (!WebApi._instance) {
            const locale = WebApi.getFiles(`${base}\/${config.locale}`, /\.local.json$/);
            const models = WebApi.getFiles(`${base}\/${config.models}`, /\.model.(t|j)s$/);
            const stores = WebApi.getFiles(`${base}\/${config.stores}`, /\.store.(t|j)s$/);
            const routes = WebApi.getFiles(`${base}\/${config.routes}`, /\.route.(t|j)s$/);
            // Loading Api REST class
            await Promise.all([
                models.forEach(async (data) => {
                    const fileClass = await Promise.resolve(`${data}`).then(s => __importStar(require(s)));
                    const nameClass = fileClass[Object.keys(fileClass)[0]];
                    const model = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.MODEL, nameClass);
                    const schema = model.dtbSchema ?? dtbSchema;
                    const table = schema.length != 0 ? `${schema}.${model.table}` : model.table;
                    model.table = table;
                    WebApi._models.push(nameClass);
                }),
                stores.forEach(async (data) => {
                    const fileClass = await Promise.resolve(`${data}`).then(s => __importStar(require(s)));
                    const nameClass = fileClass[Object.keys(fileClass)[0]];
                    WebApi._stores.push(nameClass);
                }),
                routes.forEach(async (data) => {
                    const fileClass = await Promise.resolve(`${data}`).then(s => __importStar(require(s)));
                    const nameClass = fileClass[Object.keys(fileClass)[0]];
                    WebApi._routes.push(nameClass);
                }),
                locale.forEach(async (data) => {
                    const text = fs_1.default.readFileSync(data, { encoding: 'utf8', flag: 'r' });
                    const item = data.split('.');
                    const json = item[1];
                    WebApi._locale.push({ [json]: text });
                }),
            ]).then(async () => {
                smartful_utils_1.RouteManager.create(WebApi._routes);
                smartful_utils_1.ModelManager.create(WebApi._models);
                smartful_utils_1.StoreManager.create(WebApi._stores);
                smartful_utils_1.StoreManager.config = config;
                smartful_utils_1.LocalManager.create(WebApi._locale, `${base}\/${config.locale}`);
                smartful_utils_1.RouteManager.setPrivateKey(`japoka@bojoka`);
                await smartful_orm_1.QueryBuilder.create(config[build]);
                await smartful_orm_1.MongoBuilder.create(build);
            });
            WebApi._instance = new WebApi(config[build]);
        }
        return WebApi._instance;
    }
    static getFiles(pathBase, matcher) {
        const fileList = Array();
        fs_1.default.readdirSync(pathBase, { withFileTypes: true })
            .flatMap((file) => file.isDirectory()
            ? WebApi.getFiles(path_1.default.join(pathBase, file.name), matcher)
            : path_1.default.join(pathBase, file.name))
            .forEach((file) => {
            if (file != undefined && file.match(matcher) !== null) {
                fileList.push(file);
            }
        });
        return fileList;
    }
}
WebApi._locale = Array();
WebApi._models = Array();
WebApi._stores = Array();
WebApi._routes = Array();
exports.default = WebApi;
