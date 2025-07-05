import {defer, Observable, of} from "rxjs";
//
import {SmpAbstractRxjsTtlCacheStrategy} from "./smp-abstract-rxjs-ttl-cache-strategy.class.js";

export class KikRxjsInMemoryCache extends SmpAbstractRxjsTtlCacheStrategy {

    private static _storage = new Map<string, unknown>();

    protected get _staticSelf(): typeof KikRxjsInMemoryCache {
        return this.constructor as typeof KikRxjsInMemoryCache;
    }

    protected _flushRaw(): Observable<void> {
        return defer(() => {
            this._staticSelf._storage.clear();

            return of(void 0);
        });
    }

    protected _readRaw(key: string): Observable<unknown | undefined> {
        return defer(() => {

            return of(this._staticSelf._storage.get(key));
        });
    }

    protected _removeRaw(key: string): Observable<void> {
        return defer(() => {
            this._staticSelf._storage.delete(key);

            return of(void 0);
        });
    }

    protected _writeRaw(key: string, value: unknown): Observable<void> {
        return defer(() => {
            this._staticSelf._storage.set(key, value);

            return of(void 0);
        });
    }
}

