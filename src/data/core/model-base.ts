import { mmn } from "../../utils/smartful.utils";
import { IModelBase } from "../smartful.data";

export class ModelBase implements IModelBase {

    id: string = '';

    _modifieds: Array<string>;

    constructor() {
        this._modifieds = Array<string>();
    }

    get annotation(): any {
        return mmn.getMetaData(this.constructor.name);
    }

    get data(): Array<any> {
        const data: Array<any> = [];
        const self: any = this;
        
        this.annotation.Properties.forEach(
            (meta: any) => {
                data[meta.name] = self[meta.name];
            }
        );
        return data;
    }

    get json(): string {
        return JSON.stringify(this.data);
    }

    get fields(): Array<string> {
        const tupla: Array<string> = Array<string>();

        this.annotation.Properties.forEach((item: any) => tupla.push(item.name));

        return tupla;
    }

    get modifieds(): Array<string> {
        return this._modifieds;
    }

    setField(field: string, value: any): void {
        const self: any = this;
        self[field] = value;
        this._modifieds.push(field);
    }

    setModified(field: string): void {
        this._modifieds.push(field);
    }

    removeEmpty(): void {
        const self: any = this;
        const data: Array<any> = this.data;

        for (let field in data) {
            const value: string = data[field]
            if (field != 'id' && (value == undefined || value.length == 0) ) {
                delete self.field;
            }
        }
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

}
