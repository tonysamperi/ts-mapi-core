import {map, Observable} from "rxjs";
import {DateTime} from "ts-luxon";
//
import {SmpAbstractCacheStrategy} from "../utils/cache/smp-abstract-cache-strategy.class.js";
import {SmpCachedValue} from "../utils/cache/smp-cached-value.interface.js";
import {smpIsSmpCachedValue} from "../utils/cache/smp-is-smp-cached-value.function.js";

export abstract class SmpAbstractRxjsTtlCacheStrategy extends SmpAbstractCacheStrategy {

    protected abstract _flushRaw(): Observable<void>;

    protected abstract _readRaw(key: string): Observable<unknown | undefined>;

    protected abstract _removeRaw(key: string): Observable<void>;

    protected abstract _writeRaw(key: string, value: unknown, ttl?: number): Observable<void>;

    flush(): Observable<void> {
        return this._flushRaw();
    }

    read<T = unknown>(key: string): Observable<T | undefined> {
        return this._readRaw(key).pipe(
            map((storedValue) => {
                if (this._isSmpCachedValue<T>(storedValue)) {
                    if (storedValue.expiry >= DateTime.now().ts) {
                        return storedValue.value as T;
                    }
                    this._removeRaw(key).subscribe(); // fire-and-forget

                    return void 0;
                }

                return storedValue as T | undefined;
            })
        );
    }

    remove(key: string) {
        return this._removeRaw(key);
    }

    write<T = unknown>(key: string, value: T, ttl?: number): Observable<void> {
        if (isNaN(+ttl!) || +ttl! <= 0) {
            return this._writeRaw(key, value, ttl);
        }

        const expiry = DateTime.now().ts + ttl! * 1000;
        const wrappedValue: SmpCachedValue<T> = {
            value,
            expiry
        };

        return this._writeRaw(key, wrappedValue, ttl);
    }

    protected _isSmpCachedValue<T>(value: unknown): value is SmpCachedValue<T> {
        return smpIsSmpCachedValue(value);
    }
}
