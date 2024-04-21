import { IModelBase } from "../../data/smartful.data";

export interface IModel {
    logbook: boolean;
    description: string;
    table: string;
    class?: IModelBase;
    dtbSchema?: string;
}

export interface IProperty {
    name: string | symbol;
    meta: any;
}

export interface IColumn {
    Policy: { 
        nullable: boolean, 
        length?: number
    },
    Column: { 
        description: string, 
        strategy?: string, 
        type: string, 
        policy: boolean, 
        logallow: boolean,
        default: any
    }
}