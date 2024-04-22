"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const result_set_1 = require("../../data/core/result-set");
const http_status_1 = require("./http.status");
const http_server_1 = require("./http.server");
const corsOptions = {
    origin: '*',
    preflightContinue: true,
    optionsSuccessStatus: http_status_1.HttpStatus.NO_CONTENT,
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
};
const isBodyError = (err) => {
    const erros = [
        'entity.too.large',
        'entity.parse.failed',
        'entity.verify.failed',
        'request.aborted',
        'request.size.invalid',
        'encoding.unsupported',
        'stream.encoding.set',
        'parameters.too.many',
        'charset.unsupported'
    ];
    return erros.includes(err.type);
};
const bodyErroHandler = ({ onError = (err, req, res) => {
}, errorMessage = (err) => {
    return err.message;
} } = {}) => {
    return (err, req, res, next) => {
        if (err && isBodyError(err)) {
            const result = new result_set_1.ResultSet();
            const message = errorMessage(err);
            onError(err, req, res);
            result
                .setStatus(err.status)
                .setText(errorMessage(err));
            result.message.message = err.type;
            result.message.status = err.status;
            result.message.code = 'BODY.ERROR';
            result.message.errorMessage = message;
            return res.status(result.status).json(result.data);
        }
        else {
            next(err);
        }
    };
};
http_server_1.app.use(body_parser_1.default.json());
http_server_1.app.use(bodyErroHandler());
http_server_1.app.use((0, cors_1.default)(corsOptions));
