"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smn = exports.StoreManager = void 0;
const serialport_1 = require("serialport");
const socket_io_client_1 = require("socket.io-client");
const smartful_data_1 = require("../../data/smartful.data");
const smartful_utils_1 = require("../smartful.utils");
/**
 * Singleton
 */
class StoreManager {
    constructor(stores = []) {
        StoreManager._stores = stores;
        this._port = new smartful_data_1.ResultSet();
    }
    static get build() {
        return StoreManager._config.build;
    }
    static get socket() {
        return StoreManager._socket;
    }
    static set config(config) {
        StoreManager._config = config;
        StoreManager.setSocket(config);
    }
    static get config() {
        return StoreManager._config;
    }
    static get thread() {
        return StoreManager._config.thread;
    }
    static get vendor() {
        return StoreManager._config.vendor;
    }
    static get stores() {
        return StoreManager._stores;
    }
    static create(stores) {
        if (!StoreManager._instance) {
            StoreManager._instance = new StoreManager(stores);
        }
        return StoreManager._instance;
    }
    static getMetaData(className) {
        const info = [];
        if (className != undefined) {
            const storeClass = StoreManager._stores.find((element) => element.name == className);
            const store = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.STORE, storeClass);
            store.class = storeClass;
            return {
                Store: store
            };
        }
        StoreManager._stores.forEach((storeClass) => {
            const store = Reflect.getMetadata(smartful_utils_1.MetaDataKeys.STORE, storeClass);
            store.class = storeClass;
            info.push({
                Store: store
            });
        });
        return info;
    }
    static async getPort() {
        const serialList = await serialport_1.SerialPort.list();
        const port = StoreManager._config.vendor.portPrinter;
        if (serialList.length == 0) {
            StoreManager._instance._port = new smartful_data_1.ResultSet()
                .setSuccess(false)
                .setText('Não existem portas!');
            return StoreManager._instance._port;
        }
        const serialPort = serialList.find(port => port.path === port.path);
        if (serialPort == null) {
            StoreManager._instance._port = new smartful_data_1.ResultSet()
                .setSuccess(false)
                .setText(`Not exists SerialPort: ${port.path}`);
            return StoreManager._instance._port;
        }
        if (serialList.length != 0) {
            try {
                if (StoreManager._instance._port instanceof smartful_data_1.ResultSet) {
                    StoreManager._instance._port = new serialport_1.SerialPort({
                        autoOpen: false,
                        path: port.path,
                        parity: port.parity,
                        baudRate: port.baudRate,
                        stopBits: port.stopBits,
                        dataBits: port.dataBits,
                    })
                        .on('open', () => console.log(`Open SerialPort: ${port.path}`));
                }
                if (!StoreManager._instance._port.isOpen) {
                    StoreManager._instance._port.open((err) => {
                        if (err != null) {
                            StoreManager._instance._port = new smartful_data_1.ResultSet()
                                .setSuccess(false)
                                .setText(err.message);
                        }
                    });
                }
            }
            catch (err) {
                StoreManager._instance._port = new smartful_data_1.ResultSet()
                    .setSuccess(false)
                    .setText(err.message);
            }
        }
        return StoreManager._instance._port;
    }
    static setSocket(config) {
        if (!StoreManager._socket) {
            const socket = config[config.build]['socket'];
            const thread = (new String(config.thread)).padStart(2, '0');
            const uri = `${socket.plan}://${socket.host}:${socket.port}`;
            StoreManager._socket = (0, socket_io_client_1.io)(uri, { autoConnect: false });
            StoreManager._socket.on("connect", () => {
                const data = {
                    'id': StoreManager._socket.id,
                    'user': `ROOM_L${thread}`,
                    'room': `ROOM_L${thread}`,
                };
                StoreManager._socket.emit('SET_ROOM', data);
            });
            StoreManager._socket.connect();
        }
    }
}
exports.StoreManager = StoreManager;
StoreManager._stores = [];
StoreManager._config = {};
/**
 * Alias for StoreManager
 */
exports.smn = StoreManager;
