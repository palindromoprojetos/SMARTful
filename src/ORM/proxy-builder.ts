import sql from "msnodesqlv8";

import { Connection, QueryAggregatorResults } from "msnodesqlv8/types";

import { ResultSet } from "../data/smartful.data";

const connectionString = (config: any): string => {
    let connString: string = JSON.stringify(config);

    connString = connString.replaceAll(':','=').replaceAll(',',';').replaceAll('"','');

    return connString.substring(1, connString.length-1);
}

export class ProxyBuilder {
    private static _instance: ProxyBuilder;

    private static _conn: Connection;

    private constructor() { }

    static async create(config?: any): Promise<ProxyBuilder> {
        if (!ProxyBuilder._instance) {
            let connString: string = connectionString(config.dtb);
            ProxyBuilder._instance = new ProxyBuilder();

            ProxyBuilder._conn = await sql.promises.open(connString);
        }

        return ProxyBuilder._instance;
    }

    static get instance(): ProxyBuilder {
        return ProxyBuilder._instance;
    }

    async transaction(): Promise<void> {
        await ProxyBuilder._conn.promises.beginTransaction();
    }

    async commit(): Promise<void> {
        await ProxyBuilder._conn.promises.commit();
    }

    async rollback(): Promise<void> {
        await ProxyBuilder._conn.promises.rollback();
    }

    async query(script: string): Promise<ResultSet> {
        const result: ResultSet = new ResultSet();
        const query: QueryAggregatorResults = await ProxyBuilder._conn.promises.query(script);

        result.setRows(query.first ?? []);

        return result;
    }

    async lastId(): Promise<string> {
        const result: ResultSet = await this.query('SELECT @@IDENTITY as ID');
        return result.first.id;
    }

}