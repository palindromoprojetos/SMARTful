import { ResultSet, notify } from "../data/smartful.data";
import { QueryBuilder } from "./smartful.orm";
import { MongoClient } from "mongodb";

const connectionString = async (build: string): Promise<string> => {
    let connString: string = '';

    try {
        const qbd: QueryBuilder = QueryBuilder.instance;

        qbd.select([
                'm.UserName'
                , 'm.Password'
                , 'm.ReplicaSet'
                , 'm.AuthMechanism'
                , 'r.ReplicaAddress'
            ])
            .from('MongoDBModel', 'm')
            .innerJoin('MongoDBReplicaSetModel', 'r', ['r.MongoDBId', '=', 'm.Id'])
            .where(['m.BuildType', '=', ':buildtype'])
            .andWhere(['r.IsActive', '=', '1'])
            .setStr('buildtype', build);

        const result: ResultSet = await qbd.execute();

        let userName: string = '';
        let passWord: string = '';
        let replicaSet: string = '';
        let authMechanism: string = '';
        let replicaAddress: Array<string> = Array<string>();

        for(const model of result.rows) {
            userName = model.username;
            passWord = model.password;
            replicaSet = model.replicaset;
            authMechanism = model.authmechanism;
            replicaAddress.push(model.replicaaddress);
        }

        connString = `mongodb://${userName}:${passWord}${replicaAddress.toString()}/?replicaSet=${replicaSet}&authMechanism=${authMechanism}`;

    } catch (err: any) {
        notify(err.message);
    }

    return connString;
}

export class MongoBuilder {
    private static _mongoc: MongoClient;

    private static _instance: MongoBuilder;

    private constructor () { }

    static async create(build: string): Promise<void> {
        if (!MongoBuilder._instance) {
            let connString: string = await connectionString(build);
            MongoBuilder._instance = new MongoBuilder();
            MongoBuilder._mongoc = new MongoClient(connString);
            await MongoBuilder._mongoc.connect();
        }
    }

    get mongoc(): MongoClient {
        return MongoBuilder._mongoc;
    }

    static get instance(): MongoBuilder {
        return MongoBuilder._instance;
    }

}