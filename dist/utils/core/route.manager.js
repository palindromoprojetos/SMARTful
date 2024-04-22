"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rmn = exports.RouteManager = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const smartful_data_1 = require("../../data/smartful.data");
const smartful_utils_1 = require("../smartful.utils");
/**
 * Singleton
 */
class RouteManager {
    constructor(routes = []) {
        RouteManager._routes = routes;
    }
    static create(routes) {
        if (!RouteManager._instance) {
            RouteManager._instance = new RouteManager(routes);
        }
        return RouteManager._instance;
    }
    static get routes() {
        return RouteManager._routes;
    }
    static invalidRoute(req, res) {
        const result = new smartful_data_1.ResultSet();
        result.message.message = 'Not Found';
        result.message.status = smartful_utils_1.HttpStatus.NOT_FOUND;
        result.message.errorMessage = 'Invalid Request!';
        result
            .setSuccess(false)
            .setMessage(result.message);
        res.status(result.status).json(result.data);
    }
    static getMetaData(className) {
        const info = [];
        if (className != undefined) {
            const routeClass = RouteManager._routes.find((element) => element.name == className);
            const prefix = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.PREFIX, routeClass);
            const suffix = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.SUFFIX, routeClass);
            prefix.class = routeClass;
            return {
                Prefix: prefix,
                Suffix: suffix
            };
        }
        RouteManager._routes.forEach((routeClass) => {
            const prefix = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.PREFIX, routeClass);
            const suffix = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.SUFFIX, routeClass);
            prefix.class = routeClass;
            info.push({
                Prefix: prefix,
                Suffix: suffix
            });
        });
        return info;
    }
    /**
     * Dynamic Routes by router decorators: RouteManager
     */
    static get router() {
        const router = (0, express_1.Router)();
        const metaData = RouteManager.getMetaData();
        metaData.forEach((data) => {
            const routes = data.Prefix.class;
            const prefix = data.Prefix.path;
            data.Suffix.forEach((item) => {
                const suffix = item.path;
                const handle = item.handle;
                const method = item.method;
                // Cria rotas dinâmicas
                router[method](`${prefix}${suffix}`, (req, res, next) => {
                    const auth = req.header('Authorization');
                    let resultSet = new smartful_data_1.ResultSet();
                    // Não requer token
                    if (item.auth == smartful_utils_1.OAuth2.none) {
                        return next();
                    }
                    // Requer token
                    if (!auth || auth.length == 0) {
                        resultSet.message.message = 'INVALID_TOKEN';
                        resultSet.message.errorMessage = 'Badly formed token!';
                        resultSet.message.status = smartful_utils_1.HttpStatus.PRECONDITION_REQUIRED;
                        resultSet
                            .setText(resultSet.message.message)
                            .setStatus(resultSet.message.status);
                        return res.status(resultSet.message.status).json(resultSet.data);
                    }
                    // RouteManager.verifyToken, => TokenSession.create
                    const token = auth.split(' ').pop();
                    resultSet = RouteManager.verifyToken(token);
                    if (!resultSet.success) {
                        return res.status(resultSet.message.status).json(resultSet.data);
                    }
                    return next();
                }, routes[handle]);
            });
        });
        return router;
    }
    static requestToken(req, res) {
        const bearer = req.header('Authorization');
        if (bearer && bearer.length != 0) {
            const token = bearer.split(' ').pop();
            const paylod = jsonwebtoken_1.default.verify(token, RouteManager._privateKey);
            smartful_utils_1.TokenSession.create(paylod, bearer);
        }
    }
    static verifyToken(token) {
        const result = new smartful_data_1.ResultSet();
        try {
            const paylod = jsonwebtoken_1.default.verify(token, RouteManager._privateKey);
            smartful_utils_1.TokenSession.create(paylod);
        }
        catch (err) {
            result.message.message = 'INVALID_TOKEN';
            result.message.errorMessage = err.message;
            result.message.status = smartful_utils_1.HttpStatus.PROXY_AUTHENTICATION_REQUIRED;
            result
                .setSuccess(false)
                .setMessage(result.message);
        }
        return result;
    }
    static createToken(payload) {
        return jsonwebtoken_1.default.sign(payload, RouteManager._privateKey);
        // return jwt.sign(payload, RouteManager._privateKey, { algorithm: 'RS256' });
    }
    static setPrivateKey(privateKey) {
        RouteManager._privateKey = privateKey;
    }
}
exports.RouteManager = RouteManager;
RouteManager._routes = [];
/**
 * Alias for RouteManager
 */
exports.rmn = RouteManager;
