import { IModelBase } from "../../data/smartful.data";

export interface IEvent {
    preUpdate(model: IModelBase): Promise<void>;
    
    posUpdate(model: IModelBase): Promise<void>;

    preInsert(model: IModelBase): Promise<void>;

    posInsert(model: IModelBase): Promise<void>;

    preDelete(model: IModelBase): Promise<void>;

    posDelete(model: IModelBase): Promise<void>;
}