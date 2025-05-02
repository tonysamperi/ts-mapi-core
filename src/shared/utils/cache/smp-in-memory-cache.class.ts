import {SmpCacheStrategy} from "./smp-cache-strategy.interface.js";

export class SmpInMemoryCache implements SmpCacheStrategy {

    private static _storage = new Map<string, unknown>();

    get staticStorage() {
        return (this.constructor as typeof SmpInMemoryCache)._storage;
    }

    flush(): void {
        this.staticStorage.clear();
    }

    read<T = unknown>(key: string): T | undefined {
        return this.staticStorage.get(key) as T;
    }

    remove(key: string): void {
        this.staticStorage.delete(key);
    }

    write<T = unknown>(key: string, value: T): void {
        this.staticStorage.set(key, value);
    }
}
