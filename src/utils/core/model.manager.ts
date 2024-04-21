import { IModel, IProperty, LocalLogbook, MetaDataKeys } from "../smartful.utils";
import { IModelBase, ModelBase, ResultSet } from '../../data/smartful.data';
import { TypeDML } from '../../ORM/smartful.orm';

/**
 * Singleton
 */
export class ModelManager {

    private static _instance: ModelManager;

    private static _models: Array<any> = [];

    private constructor(models: Array<ModelBase> = []) {
      ModelManager._models = models;
    }

    static create(models?: Array<any>): ModelManager {
      if (!ModelManager._instance) {
        ModelManager._instance = new ModelManager(models);
      }

      return ModelManager._instance;
    }

    static get models(): Array<any> {
      return ModelManager._models;
    }

    static getMetaData(className?: string): Array<any> | any {
      const info: Array<{ Model: IModel, Properties: IProperty[] }> = [];

      if (className != undefined) {
        const modelClass: any = ModelManager._models.find((element) => element.name == className);
        const model: IModel = Reflect.getMetadata(MetaDataKeys.MODEL, modelClass);

        model.class = modelClass;

        const properties: IProperty[] = Reflect.getMetadata(MetaDataKeys.PROPERTY, modelClass);

        return {
          Model: model,
          Properties: properties
        };
      }
  
      ModelManager._models.forEach(
        (modelClass: any) => {
          const model: IModel = Reflect.getMetadata(MetaDataKeys.MODEL, modelClass);

          model.class = modelClass;
  
          const properties: IProperty[] = Reflect.getMetadata(MetaDataKeys.PROPERTY, modelClass);

          info.push({
            Model: model,
            Properties: properties
          });
        }
      );
  
      return info;
    }

    static hydrate<IModelBase>(
        constr: { new (...args: any[]): IModelBase }, 
        data: any,
        ...args: any[]
    ): IModelBase {
        const model: any = new constr(...args);

        for (let field in data) {
            if (model.hasOwnProperty(field)) {
                model['setField'](field, data[field]);
            }
        }
    
        return model;
    }

    static async logbook(model: IModelBase, type: TypeDML): Promise<ResultSet> {
      let resultSet: ResultSet = new ResultSet();

      if (model.annotation.Model.logbook) {
          const logbook = new LocalLogbook(model, type);
          resultSet = await logbook.setLogTables()
      }

      return resultSet;
    }

}

/**
 * Alias for ModelManager
 */
export const mmn = ModelManager;
