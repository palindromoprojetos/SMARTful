"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.serverIO = exports.serverHttp = void 0;
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const app = (0, express_1.default)();
exports.app = app;
const serverHttp = (0, http_1.createServer)(app);
exports.serverHttp = serverHttp;
const serverIO = new socket_io_1.Server(serverHttp);
exports.serverIO = serverIO;
