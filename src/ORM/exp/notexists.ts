import Compare from "./compare";
import Eq from "./eq";

export default class NotExists extends Compare {

    parse (args: any) {
        const pattern: string = "/[\t]SELECT/";
        const eq: string = "not exists " + (new Eq(args)).value;

        this._value = eq.replace(pattern, "SELECT");
    }

}