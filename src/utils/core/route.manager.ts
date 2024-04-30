import { Router, Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import { ResultSet } from '../../data/smartful.data';
import { HttpStatus, IPrefix, ISuffix, MetaDataKeys, OAuth2, TokenSession } from "../smartful.utils";

/**
 * Singleton
 */
export class RouteManager {

    private static _privateKey: any;

    private static _instance: RouteManager;

    private static _routes: Array<any> = [];

    private constructor(routes: Array<any> = []) {
      RouteManager._routes = routes;
    }

    static create(routes?: Array<any>): RouteManager {
      if (!RouteManager._instance) {
        RouteManager._instance = new RouteManager(routes);
      }

      return RouteManager._instance;
    }

    static get routes(): Array<any> {
      return RouteManager._routes;
    }

    static invalidRoute(req: Request, res: Response) {
      const result: ResultSet = new ResultSet();
  
      result.message.message = 'Not Found';
      result.message.status = HttpStatus.NOT_FOUND;
      result.message.errorMessage = 'Invalid Request!';
  
      result
          .setSuccess(false)
          .setMessage(result.message);
  
      res.status(result.status).json(result.data);
  }

    static getMetaData(className?: string): Array<any> | any {
      const info: Array<{ Prefix: IPrefix, Suffix: ISuffix[] }> = [];
  
      if (className != undefined) {
        const routeClass: any = RouteManager._routes.find((element) => element.name == className);
        const prefix: IPrefix = Reflect.getMetadata(MetaDataKeys.PREFIX, routeClass);
        const suffix: ISuffix[] = Reflect.getMetadata(MetaDataKeys.SUFFIX, routeClass);

        prefix.class = routeClass;
  
        return {
          Prefix: prefix,
          Suffix: suffix
        };
      }

      RouteManager._routes.forEach(
        (routeClass: any) => {       
          const prefix: IPrefix = Reflect.getMetadata(MetaDataKeys.PREFIX, routeClass);       
          const suffix: ISuffix[] = Reflect.getMetadata(MetaDataKeys.SUFFIX, routeClass);

          prefix.class = routeClass;
          
          info.push({
            Prefix: prefix,
            Suffix: suffix
          });
        }
      );

      return info;
    }

    /**
     * Dynamic Routes by router decorators: RouteManager
     */
    static get router(): Router {
      const router: any = Router();
      const metaData: Array<any> = RouteManager.getMetaData();

      metaData.forEach(
        (data: any) => {
          const routes: any = data.Prefix.class;
          const prefix: string = data.Prefix.path;

          data.Suffix.forEach(
            (item: any) => {
              const suffix: string = item.path;
              const handle: string = item.handle;
              const method: string = item.method;

              // Cria rotas dinâmicas
              router[method](`${prefix}${suffix}`, 
                (req: Request, res: Response, next: NextFunction) => {
                  const auth: any = req.header('Authorization');
                  let result: ResultSet = new ResultSet();

                  // Não requer token
                  if(item.auth == OAuth2.none) {
                    return next();
                  }

                  // Requer token
                  if(!auth || auth.length == 0) {
                    result.message.message = 'INVALID_TOKEN';
                    result.message.errorMessage = 'Badly formed token!';
                    result.message.status = HttpStatus.PRECONDITION_REQUIRED;

                    result
                      .setText(result.message.message)
                      .setStatus(result.message.status);

                    return res.status(result.message.status).json(result.data);
                  }

                  // RouteManager.verifyToken, => TokenSession.create
                  const token: string = auth.split(' ').pop();
                  result = RouteManager.verifyToken(token);

                  if(!result.success) {
                    return res.status(result.message.status).json(result.data);
                  }

                  return next();
                }, routes[handle]
              );
            }
          );
        }
      );

      return (router as Router);
    }

    static requestToken(req: Request, res: Response) {
      const bearer: any = req.header('Authorization');

      if(bearer && bearer.length != 0) {
        const token: string = bearer.split(' ').pop();
        const paylod: any = jwt.verify(token, RouteManager._privateKey);
        TokenSession.create(paylod, bearer);
      }
    }

    static verifyToken(token: string): ResultSet {
      const result: ResultSet = new ResultSet();

      try {
        const paylod: any = jwt.verify(token, RouteManager._privateKey);
        TokenSession.create(paylod);
      } catch(err: any) {
        result.message.message = 'INVALID_TOKEN';
        result.message.errorMessage = err.message;
        result.message.status = HttpStatus.PROXY_AUTHENTICATION_REQUIRED;

        result
          .setSuccess(false)
          .setMessage(result.message);
      }

      return result;
    }

    static createToken(payload: any): string {
      return jwt.sign(payload, RouteManager._privateKey);
      // return jwt.sign(payload, RouteManager._privateKey, { algorithm: 'RS256' });
    }

    static setPrivateKey(privateKey: any) {
      RouteManager._privateKey = privateKey;
    }

}

/**
 * Alias for RouteManager
 */
export const rmn = RouteManager;
