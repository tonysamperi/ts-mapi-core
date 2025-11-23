import {SmpRestVerbs} from "../../shared/api/smp-rest-verbs.enum.js";
import {SmpPrimitive} from "../../shared/common/smp-primitive.type.js";

export interface SmpHttpTwoConfig<T = any> {
    ttl?: number;
    clearCache?: boolean;
    url: string;
    method?: SmpRestVerbs | string;
    useCredentials?: boolean;
    body?: T;
    headers?: Record<string, string>;
    queryParams?: Record<string, Exclude<SmpPrimitive, symbol> | Exclude<SmpPrimitive, symbol>[]>;
    transform?: boolean;
    responseType?: "blob" | "arraybuffer" | "text" | "json" | "jsonp";
}
