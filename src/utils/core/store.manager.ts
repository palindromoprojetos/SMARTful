import { SerialPort } from 'serialport';
import { Socket, io } from 'socket.io-client';

import { ResultSet } from "../../data/smartful.data";
import { IStore, MetaDataKeys } from "../smartful.utils";

/**
 * Singleton
 */
export class StoreManager {

    private static _instance: StoreManager;

    private static _stores: Array<any> = [];

    private static _config: any = {};

    private static _socket: Socket;

    private _port: SerialPort|ResultSet;

    private constructor(stores: Array<any> = []) {
      StoreManager._stores = stores;
      this._port = new ResultSet();
    }

    static get build(): string {
      return StoreManager._config.build;
    }

    static get socket(): Socket {
      return StoreManager._socket;
    }

    static set config(config: any) {
      StoreManager._config = config;
      StoreManager.setSocket(config);
    }

    static get config(): any {
      return StoreManager._config;
    }

    static get thread(): string {
      return StoreManager._config.thread;
    }

    static get vendor(): any {
      return StoreManager._config.vendor;
    }

    static get stores(): Array<any> {
      return StoreManager._stores;
    }

    static create(stores?: Array<any>): StoreManager {
      if (!StoreManager._instance) {
        StoreManager._instance = new StoreManager(stores);
      }

      return StoreManager._instance;
    }

    static getMetaData(className?: string): Array<any> | any {
      const info: Array<{ Store: IStore }> = [];

      if (className != undefined) {
        const storeClass: any = StoreManager._stores.find((element) => element.name == className);
        const store: IStore = Reflect.getMetadata(MetaDataKeys.STORE, storeClass);

        store.class = storeClass;

        return {
          Store: store
        };
      }

      StoreManager._stores.forEach((storeClass: any) => {
          const store: IStore = Reflect.getMetadata(MetaDataKeys.STORE, storeClass);

          store.class = storeClass;

          info.push({
            Store: store
          });
      });
  
      return info;
    }

    static async getPort(): Promise<SerialPort|ResultSet> {
      const serialList: Array<any> = await SerialPort.list();
      const port: any = StoreManager._config.vendor.portPrinter;

      if(serialList.length == 0) {
        StoreManager._instance._port = new ResultSet()
          .setSuccess(false)
          .setText('Não existem portas!');

        return StoreManager._instance._port;
      }

      const serialPort: any = serialList.find(port => port.path === port.path);

      if(serialPort == null) {
        StoreManager._instance._port = new ResultSet()
          .setSuccess(false)
          .setText(`Not exists SerialPort: ${port.path}`);

        return StoreManager._instance._port;
      }

      if(serialList.length != 0) {
        try {
            if(StoreManager._instance._port instanceof ResultSet) {
              StoreManager._instance._port = new SerialPort({ 
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
              StoreManager._instance._port.open(
                (err: any) => {
                  if (err != null) {
                    StoreManager._instance._port = new ResultSet()
                      .setSuccess(false)
                      .setText(err.message);
                  }
                }
              );
            }
        } catch (err: any) {
            StoreManager._instance._port = new ResultSet()
              .setSuccess(false)
              .setText(err.message);
        }
      }

      return StoreManager._instance._port;
    }

    private static setSocket(config: any): void {
      if(!StoreManager._socket) {
        const socket: any = config[config.build]['socket'];
        const thread: string = (new String(config.thread)).padStart(2, '0');
        const uri: string = `${socket.plan}://${socket.host}:${socket.port}`;

        StoreManager._socket = io(uri, { autoConnect: false });

        StoreManager._socket.on(
          "connect", () => {
            const data: any = {
              'id': StoreManager._socket.id,
              'user': `ROOM_L${thread}`,
              'room': `ROOM_L${thread}`,
            };
            StoreManager._socket.emit('SET_ROOM', data);
          }
        );

        StoreManager._socket.connect();
      }
    }

}

/**
 * Alias for StoreManager
 */
export const smn = StoreManager;
