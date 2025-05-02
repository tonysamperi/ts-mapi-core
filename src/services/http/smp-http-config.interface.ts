import {SmpRestVerbs} from "../../shared/api/index.js";

export interface SmpHttpConfig<T = any> {
    cacheKey?: string;
    clearCache?: boolean;
    url: string;
    method?: SmpRestVerbs | string;
    useCredentials?: boolean;
    body?: T;
    headers?: Record<string, string>;
    queryParams?: Record<string, string | number>;
    transform?: boolean;
    responseType?: "blob" | "arraybuffer" | "text" | "json" | "jsonp";
    // Maybe these can be handy in the future
    // preprocessError?: <U>(r: HttpException<U>) => any;
    // preprocessResponse?: (r: T) => any;
}
