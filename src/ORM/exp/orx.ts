import Compare from "./compare";
import Eq from "./eq";

export default class OrX extends Compare {

    parse (args: any) {
        let eq: string;

        if(args instanceof Array) {
            eq = (new Eq(args.join("\n\t OR ").trim())).value;
        } else {
            eq = (new Eq(args)).value;
        }

        this._value = eq!.replace(this._pattern, '');
    }
}
