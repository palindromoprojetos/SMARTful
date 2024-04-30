import { QueryBuilder, TypeDML } from '../../ORM/smartful.orm';
import { HttpStatus, IEvent, tks, mmn, smn } from '../../utils/smartful.utils';
import { Request, Response, IModelBase, IStoreBase, MessageError, ResultSet, notify } from '../smartful.data';

import moment from 'moment';

export class StoreBase implements IStoreBase, IEvent {

    public qbd: QueryBuilder;

    constructor( 
        public req?: Request,
        public res?: Response,
    ) {
        this.qbd = QueryBuilder.instance;
    }

    get annotation(): any {
        return smn.getMetaData(this.constructor.name);
    }

    get modelName(): string {
        return this.annotation.Store.model;
    }

    get model(): any {
        const model: any = mmn.getMetaData(this.modelName);

        return model;
    }

    //#region CRUD
    async get(id: string): Promise<ResultSet> {
        let result: ResultSet = new ResultSet();

        try {
            this.qbd
                .select('m.*')
                .from(this.modelName, 'm')
                .where(['m.Id','=', ':id'])
                .setStr('id', id);

                result = await this.qbd.resultSet();
        } catch (err: any) {
            result.message.status = HttpStatus.BAD_REQUEST;
            result.message.errorMessage = err.message;

            result
                .setSuccess(false)
                .setMessage(result.message);
        }

        return result;
    }

    async insert(model: IModelBase): Promise<ResultSet> {
        let result: ResultSet = new ResultSet();

        try {
            this.preInsert(model);

            // A mágica acontece aqui;
            result = await this.qbd.doExecute(model, TypeDML.DML_INSERT);

            const id: string = await this.qbd.proxy.lastId();

            model.setField('id', id);

            result
                .setStatus(HttpStatus.CREATED)
                .setRows([model.data]);

            this.posInsert(model);
        } catch (err: any) {
            result.message.status = HttpStatus.BAD_REQUEST;
            result.message.errorMessage = err.message;

            result
                .setSuccess(false)
                .setMessage(result.message);
        }

        return result;
    };

    async update(model: IModelBase): Promise<ResultSet> {
        let result: ResultSet = new ResultSet();

        try {
            this.preUpdate(model);

            // A mágica acontece aqui;
            result = await this.qbd.doExecute(model, TypeDML.DML_UPDATE);

            result.setStatus(HttpStatus.ACCEPTED);

            this.posUpdate(model);
        } catch (err: any) {
            result.message.status = HttpStatus.BAD_REQUEST;
            result.message.errorMessage = err.message;

            result
                .setSuccess(false)
                .setMessage(result.message);
        }

        return result;
    };

    async delete(model: IModelBase): Promise<ResultSet> {
        let result: ResultSet = new ResultSet();

        try {
            this.preDelete(model);

            // A mágica acontece aqui;
            result = await this.qbd.doExecute(model, TypeDML.DML_DELETE);

            result.setStatus(HttpStatus.ACCEPTED);

            this.posDelete(model);
        } catch (err: any) {
            result.message.status = HttpStatus.BAD_REQUEST;
            result.message.errorMessage = err.message;

            result
                .setSuccess(false)
                .setMessage(result.message);
        }

        return result;
    };
    //#endregion

    //#region EVENT
    async preInsert(model: IModelBase): Promise<void> {}
    async posInsert(model: IModelBase): Promise<void> {}

    async preUpdate(model: IModelBase): Promise<void> {}
    async posUpdate(model: IModelBase): Promise<void> {}

    async preDelete(model: IModelBase): Promise<void> {}
    async posDelete(model: IModelBase): Promise<void> {}
    //#endregion

    async getAccess(doaction: string): Promise<MessageError> {
        const usercode: string = tks.usercode;
        const menucode: string = this.annotation.Store.group;
        const doaccess: string = `EXEC up_UserAction '${usercode}', '${menucode}', '${doaction}'`;

        let expire: any = {};
        let today = moment();
        let result: ResultSet = new ResultSet();

        try {
            result = await this.qbd.query(doaccess).resultSet();

            if(result.records == 0) {
                result.message.status = HttpStatus.FORBIDDEN;
                result.message.message = 'Sem permissão';
            }

            expire = result.first;

            if(expire.isactive == '0') {
                result.message.status = HttpStatus.FORBIDDEN;
                result.message.message = 'Permissão desativada!';
            }

            let expireto = moment(expire.expireto);

            if(expireto < today) {
                result.message.status = HttpStatus.FORBIDDEN;
                result.message.message = 'Permissão expirou!';
            }

            if(result.message.status != HttpStatus.OK) {
                notify(result.message.message);
            }
        } catch (err: any) {
            result.message.status = HttpStatus.BAD_REQUEST;
            result.message.message = err.message;
        }

        return result.message;
    }
}