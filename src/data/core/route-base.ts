import { IRouteBase } from "../smartful.data";
import { rmn } from "../../utils/smartful.utils";

export class RouteBase implements IRouteBase {
    get annotation(): any {
        return rmn.getMetaData(this.constructor.name);
    }
}
