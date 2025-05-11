import {SmpAbstractTtlCacheStrategy} from "./smp-abstract-ttl-cache-strategy.class.js";

export class SmpBrowserCache extends SmpAbstractTtlCacheStrategy {

    constructor(protected _storage: typeof localStorage | typeof sessionStorage,
                protected _prefix: string) {
        super();
    }

    protected _flushRaw(): void {
        const keysToRemove: string[] = [];
        let i = -1;
        while (++i < this._storage.length) {
            const key = this._storage.key(i);
            if (key && key.startsWith(this._prefix)) {
                keysToRemove.push(key);
            }
        }
        i = -1;
        while (++i < keysToRemove.length) {
            this._storage.removeItem(keysToRemove[i]);
        }
    }

    protected _readRaw(key: string): unknown | undefined {
        const raw = this._storage.getItem(this._prefix + key);
        try {
            return raw ? JSON.parse(raw) : undefined;
        }
        catch {
            console.warn(`${this.constructor.name}: failed to parse cache item for key ${this._prefix + key}`);

            return void 0;
        }
    }

    protected _removeRaw(key: string): void {
        this._storage.removeItem(this._prefix + key);
    }

    protected _writeRaw(key: string, value: unknown): void {
        try {
            this._storage.setItem(this._prefix + key, JSON.stringify(value));
        }
        catch (e) {
            console.warn(`${this.constructor.name}: failed to write cache item for key ${this._prefix + key}`, e);
        }
    }

}


