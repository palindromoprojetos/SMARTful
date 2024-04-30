import 'reflect-metadata';

import { Application }  from 'express';

import fs from 'fs';
import path from 'path';

import { QueryBuilder } from './ORM/smartful.orm';
import { IModelBase, IRouteBase, IStoreBase } from './data/smartful.data';
import { ModelManager, RouteManager, StoreManager, LocalManager, MetaDataKeys, IModel } from './utils/smartful.utils';

import { serverHttp, app } from './utils/core/http.server';

import "./utils/core/http.socket";
import "./utils/core/http.config";

/**
 * WebApi
 * Singleton class
 */
export class WebApi {

    private static _instance: WebApi;
    private static _basePath: string;
    private static _app: Application;

    private static _locale: Array<any> = Array<any>();
    private static _models: Array<IModelBase> = Array<IModelBase>();
    private static _stores: Array<IStoreBase> = Array<IStoreBase>();
    private static _routes: Array<IRouteBase> = Array<IRouteBase>();

    private constructor(config: any) {
        WebApi._app = app;
        WebApi._basePath = config.setting.basePath;
        serverHttp.listen(config.setting.listener);
    }

    /**
     * Picard says "engage", to start api
     */
    engage() {
        WebApi._app.use(
            WebApi._basePath,
            RouteManager.router,
            RouteManager.invalidRoute,
        );
    }

    static async create(config: any): Promise<WebApi> {
        const build: string = config.build;
        const base = `${__dirname}/\../\api`;
        const dtbSchema: string = config[build].dtbSchema;

        if (!WebApi._instance) {
            const locale: Array<string> = WebApi.getFiles(`${base}\/${config.locale}`, /\.local.json$/);
            const models: Array<string> = WebApi.getFiles(`${base}\/${config.models}`, /\.model.(t|j)s$/);
            const stores: Array<string> = WebApi.getFiles(`${base}\/${config.stores}`, /\.store.(t|j)s$/);
            const routes: Array<string> = WebApi.getFiles(`${base}\/${config.routes}`, /\.route.(t|j)s$/);

            // Loading Api REST class
            await Promise.all([
                models.forEach(async (data: string) => {
                    const fileClass: any = await import(data);
                    const nameClass: any = fileClass[Object.keys(fileClass)[0]];
                    const model: IModel = Reflect.getMetadata(MetaDataKeys.MODEL, nameClass);
                    const schema: string = model.dtbSchema ?? dtbSchema;
                    const table: any = schema.length != 0 ? `${schema}.${model.table}` : model.table;

                    model.table = table;

                    WebApi._models.push(nameClass);
                }),
                stores.forEach(async (data: string) => {
                    const fileClass: any = await import(data);
                    const nameClass: any = fileClass[Object.keys(fileClass)[0]];

                    WebApi._stores.push(nameClass);
                }),
                routes.forEach(async (data: string) => {
                    const fileClass: any = await import(data);
                    const nameClass: any = fileClass[Object.keys(fileClass)[0]];

                    WebApi._routes.push(nameClass);
                }),
                locale.forEach(async (data: string) => {
                    const text: string = fs.readFileSync(data, {encoding:'utf8', flag:'r'});
                    const item: Array<string> = data.split('.');
                    const json: string = item[1];

                    WebApi._locale.push({[json]: text});
                }),
            ]).then(
                async () => {
                    RouteManager.create(WebApi._routes);
                    ModelManager.create(WebApi._models);
                    StoreManager.create(WebApi._stores);
                    StoreManager.config = config;

                    LocalManager.create(WebApi._locale,`${base}\/${config.locale}`);

                    RouteManager.setPrivateKey(`japoka@bojoka`);

                    await QueryBuilder.create(config[build]);
                }
            );

            WebApi._instance = new WebApi(config[build]);
        }

        return WebApi._instance;
    }

    private static getFiles(
        pathBase: string, 
        matcher: {
            [Symbol.match](string: string): RegExpMatchArray | null
        }
    ): Array<string> {
        const fileList: Array<string> = Array<string>();

        fs.readdirSync(pathBase, { withFileTypes: true })
            .flatMap((file) => 
                file.isDirectory()
                    ? WebApi.getFiles(path.join(pathBase, file.name), matcher)
                    : path.join(pathBase, file.name)
            )
            .forEach((file) => {
                if(file != undefined && file.match(matcher) !== null) {
                    fileList.push(file);
                }
            });

        return fileList;
    }

}
