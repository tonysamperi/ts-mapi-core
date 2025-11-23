import {SmpErrorResponse} from "../../shared/api/smp-error-response.class.js";
import {SmpGenericConstructor} from "../../shared/common/smp-generic-constructor.type.js";
import {SmpCrypto} from "../../shared/crypto/smp-crypto.class.js";
import {SmpAbstractTtlCacheStrategy} from "../../shared/utils/cache/smp-abstract-ttl-cache-strategy.class.js";
import {SmpInMemoryCache} from "../../shared/utils/cache/smp-in-memory-cache.class.js";
//
import {SmpDynamicFetchReturn} from "./smp-dynamic-fetch-return.type.js";
import {SmpHttpSessionStorageCache} from "./smp-http-session-storage-cache.class.js";
import {SmpHttpStatusCodes} from "./smp-http-status-code.enum.js";
import {SmpHttpTwoConfig} from "./smp-http-two-config.interface.js";

interface HttpException<T = any> {
    status: SmpHttpStatusCodes;
    message: string;
    body: T;
}

interface ParseableErrorClass<T> {
    fromPlain(plain: unknown): T;
}

export class SmpHttpTwoService {

    protected static _cacheStrategy: SmpAbstractTtlCacheStrategy = typeof sessionStorage !== "undefined"
        ? new SmpHttpSessionStorageCache()
        : new SmpInMemoryCache();
    protected static _errorClass: SmpGenericConstructor & ParseableErrorClass<any> = SmpErrorResponse;
    protected static _mergeParamsFallbackBaseUrl: string = "https://uc-api-nest-common-fe";
    protected static _running = new Map<string, Promise<any>>();

    static $http(config: SmpHttpTwoConfig): Promise<SmpDynamicFetchReturn<SmpHttpTwoConfig["responseType"], any>>;
    static $http<T = any>(config: SmpHttpTwoConfig): Promise<T>;
    static $http(config: SmpHttpTwoConfig): Promise<SmpDynamicFetchReturn<SmpHttpTwoConfig["responseType"], Blob>>;
    static $http(config: SmpHttpTwoConfig): Promise<SmpDynamicFetchReturn<SmpHttpTwoConfig["responseType"], ArrayBuffer>>;
    static $http(config: SmpHttpTwoConfig): Promise<SmpDynamicFetchReturn<SmpHttpTwoConfig["responseType"], string>>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static $http<T, U, V>(config: SmpHttpTwoConfig): Promise<SmpDynamicFetchReturn<SmpHttpTwoConfig["responseType"], U>>;
    static $http<T extends object | Blob | ArrayBuffer, U, V>(
        config: SmpHttpTwoConfig<T>
    ): Promise<SmpDynamicFetchReturn<SmpHttpTwoConfig["responseType"], U>> {
        return this._generateAjax<T, U, V>(config);
    }

    /**
     * Internal method to generate ajax config
     * @param config
     * @protected
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    static async _generateAjax<T, U, V = unknown>(config: SmpHttpTwoConfig<T>): Promise<SmpDynamicFetchReturn<typeof config.responseType, U>> {
        const uniqueKey = this._generateCacheKey(config);
        const handleCache = +(config.ttl || 0) > 0;
        if (handleCache) {
            const cached = this._cacheStrategy.read<T>(uniqueKey);
            if (cached) {

                return Promise.resolve(cached) as Promise<SmpDynamicFetchReturn<typeof config.responseType, U>>;
            }

        }

        // Dedupe: reuse an in-flight promise keyed by uniqueKey if present
        const inFlight = this._running.get(uniqueKey);
        if (inFlight) {

            return inFlight as Promise<SmpDynamicFetchReturn<typeof config.responseType, U>>;
        }
        const requestPromise = this._generateAjaxBase<T, U, V>(config)
            .then((response) => {
                if (handleCache) {
                    this._cacheStrategy.write(uniqueKey, response, config.ttl);
                }

                return response;
            })
            .finally(() => {
                this._running.delete(uniqueKey);
            });
        this._running.set(uniqueKey, requestPromise);

        return requestPromise;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    static async _generateAjaxBase<T, U, V = unknown>(config: SmpHttpTwoConfig<T>): Promise<SmpDynamicFetchReturn<typeof config.responseType, U>> {
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
                        // rejectValue = plainToInstance(this._errorClass, json);
                        rejectValue = this._errorClass.fromPlain(json) as V;
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

    static mergeQueryParams(url: string, queryParams: SmpHttpTwoConfig["queryParams"]) {
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

    protected static _generateCacheKey(config: SmpHttpTwoConfig): string {
        let baseKey = `${config.method}:${config.url}`;

        if (config.queryParams && Object.keys(config.queryParams).length > 0) {
            baseKey += `:${SmpCrypto.md5(JSON.stringify(config.queryParams))}`;
        }

        return config.body && Object.keys(config.body).length > 0
            ? `${baseKey}:${SmpCrypto.md5(JSON.stringify(config.body))}`
            : baseKey;
    }

    protected static async _preprocessRequest<T>(config: SmpHttpTwoConfig<T>): Promise<SmpHttpTwoConfig<T>> {
        // Empty base hook that you can override in derived classes
        return config;
    }

    protected static async _preprocessResponse<T>(_config_: SmpHttpTwoConfig<T>, res: Response): Promise<Response> {
        // Empty base hook that you can override in derived classes
        return res;
    }

}

