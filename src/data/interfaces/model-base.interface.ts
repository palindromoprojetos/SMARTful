export interface IModelBase {
    id: string;

    _modifieds: Array<string>;

    get annotation(): any;
    get fields(): Array<string>;
    get modifieds(): Array<string>;

    get data(): any;
    get json(): string;

    removeEmpty(): void;

    setModified(field: string): void;

    setField(field: string, value: any): void;
}