import { IStore, MetaDataKeys } from "../smartful.utils";

/**
 * Singleton
 */
export class StoreManager {

    private static _instance: StoreManager;

    private static _stores: Array<any> = [];

    private static _config: any = {};

    private constructor(stores: Array<any> = []) {
      StoreManager._stores = stores;
    }

    static get build(): string {
      return StoreManager._config.build;
    }

    static set config(config: any) {
      StoreManager._config = config;
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

}

/**
 * Alias for StoreManager
 */
export const smn = StoreManager;
