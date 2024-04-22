import { HttpStatus } from '../../utils/smartful.utils';
import { IResultSet, IResultSetData, MessageError } from '../smartful.data';

export class ResultSet implements IResultSet {
    static readonly OK = 'OK';
    static readonly EMPTY_RESULT = 'Não há registros a serem mostrados!';
    static readonly FAILURE_STATEMENT = 'Houve falha na execução da solicitação!';

    private _data: IResultSetData;

    constructor() {
        this._data = {
            text: ResultSet.OK,
            rows: Array<any>(),

            paging: 0,
            status: HttpStatus.OK,
            
            records: 0,
            success: true,
            message: new MessageError(),
        };
    }

    toJson = (): string => JSON.stringify(this._data, null, 2);

    toObject = (): any => JSON.parse(this.toJson());

    get data(): IResultSetData {
        return this._data;
    }

    get first(): any {
        const rows: Array<any> = this._data.rows;
        return (rows.length != 0) ? rows[0] : rows;
    }

    get text(): string {
        return this._data.text;
    }

    get rows(): Array<any> {
        return this._data.rows;
    }

    set rows(rows: Array<any>) {
        this._data.rows = rows;
    }

    get status(): number {
        return this._data.status;
    }

    get paging(): number {
        return this._data.paging;
    }

    get records(): number {
        return this._data.records;
    }

    get message(): MessageError {
        return this._data.message;
    }

    get success(): boolean {
        return this._data.success;
    }

    getFields(column: Array<any>): Array<any> {
        const rows: Array<any> = Array<any>();
        
        this._data.rows.forEach(
            (item: any) => {
                const data: any = {};
                column.forEach((name: string) => data[name] = item[name.toLowerCase()]);
                rows.push(data);
            }
        );

        return rows;
    }

    /**
     * Convert true -> '1', false -> '0'
     * @param value 
     * @returns converted value
     */
    private bit(value: string): string {
        let convert: string;

        switch (value.toLowerCase()) {
            case 'null':
                convert = '';
                break;
            case 'true':
                convert = '1';
                break;
            case 'false':
                convert = '0';
                break;
            default:
                convert = value;
                break;
        }

        return convert;
    }

    setRows(value: Array<any>): ResultSet {
        value.forEach(
            (row: any, index: number) => {
                value[index] = Object.fromEntries(
                    Object.entries(row).map(
                        ([k, v]) => {
                            k = k.toLowerCase().toString();
                            return ((typeof v) == 'object') ? [k, v] : [k, this.bit(`${v}`)];
                        }
                    )
                );
            }
        );

        this._data.rows = value;
        this._data.records = Number.parseInt(`${value.length}`);

        return this;
    }

    setText(value?: string): ResultSet {
        this._data.text = value ?? '';
        return this;
    }

    setStatus(value: number): ResultSet {
        this._data.status = value;
        return this;
    }

    setPaging(records: number, limit?: number): ResultSet {

        if(limit != undefined) {
            const rest: number = records % limit;
            const page: number = Math.floor(records / limit);
    
            this._data.paging = rest != 0 ? (page+1) : page;
        } else {
            this._data.paging = records;
        }
        
        return this;
    }

    setRecords(value: number): ResultSet {
        this._data.records = Number.parseInt(`${value}`);
        return this;
    }

    setSuccess(value: boolean): ResultSet {
        this._data.success = value;
        this._data.text = (this._data.text == ResultSet.OK && !value) ? '' : this._data.text;
        return this;
    }

    setMessage(value?: MessageError): ResultSet {
        this._data.message = new MessageError();

        if(value instanceof MessageError) {
            this._data.message = value;
            this._data.text = value.message;
            this._data.status = value.status;
        }

        return this;
    }
}
