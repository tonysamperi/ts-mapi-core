import {DateTime} from "ts-luxon";
//
import {SmpAbstractCacheStrategy} from "./smp-abstract-cache-strategy.class.js";
import {SmpCachedValue} from "./smp-cached-value.interface.js";

export abstract class SmpAbstractTtlCacheStrategy extends SmpAbstractCacheStrategy {

    protected abstract _flushRaw(): void;

    protected abstract _readRaw(key: string): unknown | undefined;

    protected abstract _removeRaw(key: string): void;

    protected abstract _writeRaw(key: string, value: unknown): void;

    flush(): void {
        this._flushRaw();
    }

    read<T = unknown>(key: string): T | undefined {
        const storedValue = this._readRaw(key);
        if (this._isKikCachedValue<T>(storedValue)) {
            if (storedValue.expiry >= DateTime.now().ts) {
                return storedValue.value as T;
            }
            this._removeRaw(key);

            return void 0;
        }
        return storedValue as T | undefined;
    }

    remove(key: string): void {
        this._removeRaw(key);
    }


    write<T = unknown>(key: string, value: T, ttl?: number): void {
        if (isNaN(+ttl!) || +ttl! <= 0) {
            this._writeRaw(key, value);
            return;
        }
        const expiry = DateTime.now().ts + ttl! * 1000;
        const wrappedValue: SmpCachedValue<T> = {
            value: value,
            expiry: expiry
        };
        this._writeRaw(key, wrappedValue);
    }

    protected _isKikCachedValue<T>(value: unknown): value is SmpCachedValue<T> {
        return (
            typeof value === "object" &&
            value !== null &&
            "value" in value &&
            "expiry" in value &&
            typeof (value as any).expiry === "number"
        );
    }
}
