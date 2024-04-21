import { HttpStatus } from "../../utils/smartful.utils";

export interface IResultSet {

    toJson(): string;

    get text(): string;

    get rows(): Array<any>;

    get paging(): number;
    
    get status(): number;
    
    get success(): boolean;
    
    get records(): number;

    get message(): MessageError;

    setRows(value: Array<any>): IResultSet;

    setText(value?: string): IResultSet;

    setStatus(value: number): IResultSet;

    getFields(column: Array<any>): Array<any>;

    setPaging(records: number, limit?: number): IResultSet;

    setRecords(value: number): IResultSet;

    setSuccess(value: boolean): IResultSet;

    setMessage(value?: MessageError): IResultSet;
}

export interface IResultSetData {
    text: string;
    rows: Array<any>;

    paging: number;
    status: number;
    
    records: number;
    success: boolean;
    message: MessageError;
}

export class MessageError {
    constructor(
        public status: number = HttpStatus.OK,
        public code: string = 'THATS_ALL_FOLKS',
        public message: string = 'Solicitação concluída!',
        public errorMessage: string = 'Solicitação concluída!',
    ) {
    }

    toJson = (): string => JSON.stringify(this);
}
