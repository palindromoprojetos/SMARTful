import Compare from "./compare";
import Eq from "./eq";

export default class Exists extends Compare {

    parse (args: any) {
        const pattern: string = "/[\t]SELECT/";
        const eq: string = "exists " + (new Eq(args)).value;

        this._value = eq.replace(pattern, "SELECT");
    }

}