import { IModel, IColumn, IProperty, MetaDataKeys } from "../smartful.utils";

export const Model = (model: IModel): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(MetaDataKeys.MODEL, model, target);
  };
}

export const Property = (column: IColumn): PropertyDecorator => {
  return (target, propertyKey) => {
    const modelClass = target.constructor;
    const properties: IProperty[] = Reflect.hasMetadata(MetaDataKeys.PROPERTY, modelClass) ?
      Reflect.getMetadata(MetaDataKeys.PROPERTY, modelClass) : [];

    properties.push({
      name: propertyKey,
      meta: column
    });

    Reflect.defineMetadata(MetaDataKeys.PROPERTY, properties, modelClass);
  }
}