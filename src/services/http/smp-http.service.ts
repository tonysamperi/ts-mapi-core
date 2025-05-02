import {SmpHttpConfig} from "./smp-http-config.interface.js";
import {SmpDynamicFetchReturn} from "./smp-dynamic-fetch-return.type.js";
import {SmpHttpSessionStorageCache} from "./smp-http-session-storage-cache.class.js";
import {SmpInMemoryCache} from "../../shared/utils/cache/smp-in-memory-cache.class.js";
import {SmpCacheStrategy} from "../../shared/utils/cache/smp-cache-strategy.interface.js";
import {SmpErrorResponse} from "../../shared/api/smp-error-response.class.js";
import {SmpGenericConstructor} from "../../shared/common/smp-generic-constructor.type.js";
import {SmpHttpStatusCodes} from "./smp-http-status-code.enum.js";

interface HttpException<T = any> {
    status: SmpHttpStatusCodes;
    message: string;
    body: T;
}

interface ParseableErrorClass<T> {
    fromPlain(plain: unknown): T;
}

export class SmpHttpService {

    protected static _cachePrefix: string = "kik_rest_cache_";
    protected static _cacheStrategy: SmpCacheStrategy = typeof sessionStorage !== "undefined"
        ? new SmpHttpSessionStorageCache()
        : new SmpInMemoryCache();
    protected static _config = {
        cachePrefix: this._cachePrefix,
        shared: new Map<string, Promise<any>>()
    };
    protected static _errorClass: SmpGenericConstructor & ParseableErrorClass<any> = SmpErrorResponse;
    protected static _mergeParamsFallbackBaseUrl: string = "https://ts-mapi-core";

    static $http(config: SmpHttpConfig): Promise<SmpDynamicFetchReturn<SmpHttpConfig["responseType"], any>>;
    static $http<T = any>(config: SmpHttpConfig): Promise<T>;
    static $http(config: SmpHttpConfig): Promise<SmpDynamicFetchReturn<SmpHttpConfig["responseType"], Blob>>;
    static $http(config: SmpHttpConfig): Promise<SmpDynamicFetchReturn<SmpHttpConfig["responseType"], ArrayBuffer>>;
    static $http(config: SmpHttpConfig): Promise<SmpDynamicFetchReturn<SmpHttpConfig["responseType"], string>>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static $http<T, U, V>(config: SmpHttpConfig): Promise<SmpDynamicFetchReturn<SmpHttpConfig["responseType"], U>>;
    static $http<T extends object | Blob | ArrayBuffer, U, V>(
        config: SmpHttpConfig<T>
    ): Promise<SmpDynamicFetchReturn<SmpHttpConfig["responseType"], U>> {
        return this._generateAjax<T, U, V>(config);
    }

    /**
     * Internal method to generate ajax config
     * @param config
     * @protected
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static async _generateAjax<T, U, V = unknown>(config: SmpHttpConfig<T>): Promise<SmpDynamicFetchReturn<typeof config.responseType, U>> {
        if (config.cacheKey) {
            const cached = this._cacheRead<U>(config.cacheKey);
            if (cached) {

                return Promise.resolve(cached);
            }

            return this._generateAjaxBase<T, U, V>(config).then((response) => {
                config.cacheKey && this._cacheWrite(config.cacheKey, response);

                return response;
            });
        }

        return this._generateAjaxBase<T, U, V>(config);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    static async _generateAjaxBase<T, U, V = unknown>(config: SmpHttpConfig<T>): Promise<SmpDynamicFetchReturn<typeof config.responseType, U>> {
        const processedConfig = await this._preprocessRequest(config);
        const opts: RequestInit = {
            method: processedConfig.method,
            headers: new Headers({
                "content-type": "application/json",
                ...processedConfig.headers
            }),
            body: processedConfig.body ? JSON.stringify(processedConfig.body) : null
        };

        if (processedConfig.useCredentials) {
            opts.credentials = "include";
        }

        processedConfig.url = this.mergeQueryParams(processedConfig.url, processedConfig.queryParams);


        return fetch(processedConfig.url, opts)
            .then((res) => this._preprocessResponse(config, res))
            .then((res: Response) => {
                if (res.ok) {
                    if (res.status === 204 || res.headers.get("content-length") === "0") {
                        // No content scenario (204 No Content or empty body)
                        return null as SmpDynamicFetchReturn<typeof processedConfig.responseType, U>;
                    }

                    switch (processedConfig.responseType) {
                        case "blob":
                            return res.blob();
                        case "arraybuffer":
                            return res.arrayBuffer();
                        case "text":
                            return res.text();
                        case "json":
                        default:
                            return res.json() as Promise<U>;
                    }
                }

                return res.json().then((json: V) => {
                    let rejectValue: V | typeof this._errorClass = json;
                    // to be able to access error status when you catch the error
                    try {
                        rejectValue = this._errorClass.fromPlain(json);
                    }
                    catch (e) {
                        console.debug("http: failed to parse error response into ErrorResponse", e);
                    }

                    return Promise.reject({
                        status: res.status,
                        message: res.statusText,
                        body: rejectValue
                    } as HttpException);
                });
            });
    }

    static cacheFlush(): void {
        this._cacheStrategy.flush();
    }

    static mergeQueryParams(url: string, queryParams: SmpHttpConfig["queryParams"]) {
        const isAbsoluteUrl = url.startsWith("http");
        if (queryParams) {
            const tmpUrl = new URL(url, globalThis?.location?.origin || this._mergeParamsFallbackBaseUrl);
            const existingParams = Object.fromEntries(tmpUrl.searchParams.entries());
            tmpUrl.search = new URLSearchParams({
                ...existingParams,
                // Normalize the params to string
                ...Object.fromEntries(
                    Object.entries(queryParams).map(([key, value]) => [key, `${value}`])
                )
            }).toString();
            url = isAbsoluteUrl ? tmpUrl.href : tmpUrl.pathname + tmpUrl.search;
        }

        return url;
    }

    // Protected

    protected static _cacheKey(key: string): string {
        return `${this._config.cachePrefix}${key}`;
    }

    protected static _cachePop<T = unknown>(key: string): T | void {
        const value = this._cacheRead<T>(key);
        this._cacheRemove(key);

        return value;
    }

    protected static _cacheRead<T>(key: string): T | void {
        return this._cacheStrategy.read<T>(this._cacheKey(key));
    }

    protected static _cacheRemove(key: string): void {
        this._cacheStrategy.remove(this._cacheKey(key));
    }

    protected static _cacheWrite<T>(key: string, value: T): void {
        this._cacheStrategy.write<T>(this._cacheKey(key), value);
    }

    protected static async _preprocessRequest<T>(config: SmpHttpConfig<T>): Promise<SmpHttpConfig<T>> {
        // Empty base hook that you can override in derived class
        return config;
    }

    protected static async _preprocessResponse<T>(_config_: SmpHttpConfig<T>, res: Response): Promise<Response> {
        // Empty base hook that you can override in derived class
        return res;
    }

}

