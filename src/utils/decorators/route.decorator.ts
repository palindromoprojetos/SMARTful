import { IPrefix, ISuffix, HttpVerbKeys, MetaDataKeys, OAuth2 } from "../smartful.utils";

export const Prefix = (prefix: IPrefix): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(MetaDataKeys.PREFIX, prefix, target);
  };
}

const factory = (method: HttpVerbKeys) => {
    return (path: string = '', auth: OAuth2 = OAuth2.bearer) => {
      return (target: any, propertyKey: string) => {
        
        let isStatic = (typeof target === 'function');
        
        const routeClass = isStatic ? target : target.constructor;
  
        const suffix: ISuffix[] = Reflect.hasMetadata(MetaDataKeys.SUFFIX, routeClass) ?
          Reflect.getMetadata(MetaDataKeys.SUFFIX, routeClass) : [];
  
          suffix.push({
            path,
            auth,
            method,
            handle: propertyKey
          });
  
        Reflect.defineMetadata(MetaDataKeys.SUFFIX, suffix, routeClass);
      }
    }
}

export const HttpGet = factory(HttpVerbKeys.GET);
export const HttpPut = factory(HttpVerbKeys.PUT);
export const HttpPost = factory(HttpVerbKeys.POST);
export const HttpDelete = factory(HttpVerbKeys.DELETE);