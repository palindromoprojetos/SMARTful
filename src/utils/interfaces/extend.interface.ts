declare global {
    interface String {
      toAddPrefix(prefix: string): string;
    }
    interface Number {  
        thousandsSeperator(): String;  
    }
    interface Array<T> {
      toAddPostfix(postFix: string): Array<T>;
      first(): Array<T> | any;
    }
  }

String.prototype.toAddPrefix = function (prefixStr: string) {
    return `${prefixStr}${this}`;
}

Array.prototype.toAddPostfix = function (postFixStr: string) {
    var _self = this as Array<string>;
    return _self.map(a => `${a}${postFixStr}`)
};

String.prototype.toAddPrefix = function (prefixStr: string) {
    return `${prefixStr}${this}`;
}

Number.prototype.thousandsSeperator = function(): string {  
    return Number(this).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
} 

Array.prototype.toAddPostfix = function (postFixStr: string) {
    var _self = this as Array<string>;
    return _self.map(a => `${a}${postFixStr}`)
};

Array.prototype.first = function () {
    return this.length != 0 ? this[0] : null;
};

export {}