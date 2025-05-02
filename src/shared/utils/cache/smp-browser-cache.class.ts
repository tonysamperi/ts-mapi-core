import {SmpCacheStrategy} from "./smp-cache-strategy.interface.js";

export class SmpBrowserCache implements SmpCacheStrategy {

    constructor(protected _storage: typeof global.localStorage | typeof global.sessionStorage,
                protected _prefix: string) {
    }

    flush(): void {
        Object.keys(this._storage)
            .filter((key) => key.startsWith(this._prefix))
            .forEach(this.remove.bind(this));
    }

    read<T = unknown>(key: string): T | undefined {
        const raw = this._storage.getItem(this._prefix + key);
        try {
            return raw ? JSON.parse(raw) : undefined;
        }
        catch {
            return undefined;
        }
    }

    remove(key: string): void {
        this._storage.removeItem(this._prefix + key);
    }

    write<T = unknown>(key: string, value: T): void {
        this._storage.setItem(this._prefix + key, JSON.stringify(value));
    }
}


