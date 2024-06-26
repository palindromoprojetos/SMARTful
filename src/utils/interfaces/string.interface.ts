/* tslint:disable:interface-name */
declare interface String {
    /**
     *
     * Determines whether the beginning of this string instance matches a specified string.
     * @param {string} searchTerm the specified string
     * @param {boolean} ignoreCase if <c>true</c> (default) than the case will be ignored, otherwise not
     * @returns {boolean} <c>true</c> if this strings starts with the specified searchTerm, otherwise <c>false</c>
     */
    StartsWith(searchTerm: string, ignoreCase?: boolean): boolean;

    /**
     *
     * Determines whether the ending of this string instance matches a specified string.
     * @param {string} searchTerm the specified string
     * @param {boolean} ignoreCase if <c>true</c> (default) than the case will be ignored, otherwise not
     * @returns {boolean} <c>true</c> if this strings ends with the specified searchTerm, otherwise <c>false</c>
     */
    EndsWith(searchTerm: string, ignoreCase?: boolean): boolean;

    /**
     *
     * Returns a value indicating whether a specified substring occurs within this string.
     * @param {string} searchTerm the specified string
     * @param {boolean} ignoreCase if <c>true</c> (default) than the case will be ignored, otherwise not
     * @returns {boolean} <c>true</c> if this strings contains the specified searchTerm, otherwise <c>false</c>
     */
    Contains(searchTerm: string, ignoreCase?: boolean): boolean;

    /**
     *
     * Reports the zero-based index of the first occurrence of a specified Unicode
     * character or string within this instance. The method returns -1 if the
     * character or string is not found in this instance.
     * @param {string} searchTerm the specified string
     * @param {boolean} ignoreCase if <c>true</c> (default) than the case will be ignored, otherwise not
     * @returns {number} the zero-based index of the position or -1 if not exists
     */
    IndexOf(searchTerm: string, ignoreCase?: boolean): number;

    /**
     *
     * Returns a new string in which a specified string is inserted
     * at a specified index position in this instance.
     * @param {number} startIndex the specified index position
     * @param {string} valueToInsert the string to insert
     * @returns {string} the new generated string
     */
    Insert(startIndex: number, valueToInsert: string): string;

    /**
     *
     * Determines whether two String objects have the same value.
     * @param {string} value The string to compare to this instance
     * @param {boolean} ignoreCase if <c>true</c> (default) than the case will be ignored, otherwise not
     * @returns {boolean} <c>true</c> if the value of the value parameter
     * is the same as this string; otherwise, <c>false</c>.
     */
    Equals(value: string, ignoreCase?: boolean): boolean;

    /**
     *
     * Determines whether a String is empty or whitespace.
     * @returns {boolean} <c>true</c> if the value of this string is empty or whitespace; otherwise, <c>false</c>.
     */
    IsEmpty(): boolean;
}

String.prototype.StartsWith = function (this: string, searchTerm: string, ignoreCase: boolean = true): boolean {

    let searchIn: string = this;

    if (ignoreCase) {
        searchTerm = searchTerm.toLocaleLowerCase();
        searchIn = searchIn.toLocaleLowerCase();
    }

    return searchIn.indexOf(searchTerm) === 0;
};

String.prototype.EndsWith = function (this: string, searchTerm: string, ignoreCase: boolean = true): boolean {
    let searchIn: string = this;

    if(searchTerm.length > searchIn.length) {
        return false;
    }

    if (ignoreCase) {
        searchTerm = searchTerm.toLocaleLowerCase();
        searchIn = searchIn.toLocaleLowerCase();
    }

    const position: number = searchIn.length - searchTerm.length;
    const lastIndex: number = searchIn.indexOf(searchTerm, position);
    return lastIndex !== -1 && lastIndex === position;
};

String.prototype.Contains = function (this: string, searchTerm: string, ignoreCase: boolean = true): boolean {
    let searchIn: string = this;

    if (ignoreCase) {
        searchTerm = searchTerm.toLocaleLowerCase();
        searchIn = searchIn.toLocaleLowerCase();
    }

    return searchIn.indexOf(searchTerm) >= 0;
};

String.prototype.IndexOf = function (this: string, searchTerm: string, ignoreCase: boolean = true): number {
    let searchIn: string = this;

    if (ignoreCase) {
        searchTerm = searchTerm.toLocaleLowerCase();
        searchIn = searchIn.toLocaleLowerCase();
    }

    return searchIn.indexOf(searchTerm);
};

String.prototype.Insert = function(this: string, startIndex: number, valueToInsert: string): string {
    const text: string = this;
    const first: string = text.substring(0, startIndex);
    const second: string = text.substring(startIndex, text.length);

    return first + valueToInsert + second;
};

String.prototype.Equals = function(this: string, value: string, ignoreCase?: boolean): boolean {
    let s: string = this.slice();
    if (ignoreCase) {
        s = s.toLocaleLowerCase();
        value = value.toLocaleLowerCase();
    }

    return value === s;
};

String.prototype.IsEmpty = function(this: string): boolean {
    const s: string = this;
    return s.length < 1 || s.trim().length < 1;
};
