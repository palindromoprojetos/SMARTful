import { IModelBase, ResultSet } from "../smartful.data";

export interface IStoreBase {

    get model(): any;

    insert(model: IModelBase): Promise<ResultSet>;

    update(model: IModelBase): Promise<ResultSet>;

    delete(model: IModelBase): Promise<ResultSet>;

}