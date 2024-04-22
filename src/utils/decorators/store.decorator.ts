import { IStore, MetaDataKeys } from "../smartful.utils";

export const Store = (store: IStore): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(MetaDataKeys.STORE, store, target);
  };
}
