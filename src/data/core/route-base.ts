import { rmn } from "../../utils/smartful.utils";
import { IRouteBase } from "../smartful.data";

export class RouteBase implements IRouteBase {
    get annotation(): any {
        return rmn.getMetaData(this.constructor.name);
    }
}
