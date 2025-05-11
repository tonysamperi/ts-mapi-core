import {SmpAbstractTtlCacheStrategy} from "./smp-abstract-ttl-cache-strategy.class.js";

export class SmpInMemoryCache extends SmpAbstractTtlCacheStrategy {

    private static _storage = new Map<string, unknown>();

    protected get _staticSelf(): typeof SmpInMemoryCache {
        return (this.constructor as typeof SmpInMemoryCache);
    }

    protected _flushRaw(): void {
        this._staticSelf._storage.clear();
    }

    protected _readRaw(key: string): unknown | undefined {
        return this._staticSelf._storage.get(key);
    }

    protected _removeRaw(key: string): void {
        this._staticSelf._storage.delete(key);
    }

    protected _writeRaw(key: string, value: unknown): void {
        this._staticSelf._storage.set(key, value);
    }

}
