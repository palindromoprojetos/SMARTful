"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoBuilder = void 0;
const smartful_data_1 = require("../data/smartful.data");
const smartful_orm_1 = require("./smartful.orm");
const mongodb_1 = require("mongodb");
const connectionString = async (build) => {
    let connString = '';
    try {
        const qbd = smartful_orm_1.QueryBuilder.instance;
        qbd.select([
            'm.UserName',
            'm.Password',
            'm.ReplicaSet',
            'm.AuthMechanism',
            'r.ReplicaAddress'
        ])
            .from('MongoDBModel', 'm')
            .innerJoin('MongoDBReplicaSetModel', 'r', ['r.MongoDBId', '=', 'm.Id'])
            .where(['m.BuildType', '=', ':buildtype'])
            .andWhere(['r.IsActive', '=', '1'])
            .setStr('buildtype', build);
        const result = await qbd.execute();
        let userName = '';
        let passWord = '';
        let replicaSet = '';
        let authMechanism = '';
        let replicaAddress = Array();
        for (const model of result.rows) {
            userName = model.username;
            passWord = model.password;
            replicaSet = model.replicaset;
            authMechanism = model.authmechanism;
            replicaAddress.push(model.replicaaddress);
        }
        connString = `mongodb://${userName}:${passWord}${replicaAddress.toString()}/?replicaSet=${replicaSet}&authMechanism=${authMechanism}`;
    }
    catch (err) {
        (0, smartful_data_1.notify)(err.message);
    }
    return connString;
};
class MongoBuilder {
    constructor() { }
    static async create(build) {
        if (!MongoBuilder._instance) {
            let connString = await connectionString(build);
            MongoBuilder._instance = new MongoBuilder();
            MongoBuilder._mongoc = new mongodb_1.MongoClient(connString);
            await MongoBuilder._mongoc.connect();
        }
    }
    get mongoc() {
        return MongoBuilder._mongoc;
    }
    static get instance() {
        return MongoBuilder._instance;
    }
}
exports.MongoBuilder = MongoBuilder;
