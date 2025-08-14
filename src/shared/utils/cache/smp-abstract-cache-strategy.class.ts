import {Observable} from "rxjs";

/**
 * Abstract class representing a caching strategy. This class is intended to be extended by concrete implementations
 * and provides an interface for performing common caching operations such as reading, writing, removing, and flushing cache entries.
 * You shouldn't need to implement this: you can go with SmpAbstractTtlCacheStrategy or SmpRxjsAbstractCacheStrategy, depending on what type of cache you want to implement.
 * For instance, for a local cache, you may stay sync, while for a Valkey cache, you should start with the rxjs.
 */
export abstract class SmpAbstractCacheStrategy {
    abstract read<T = unknown>(key: string): T | undefined | Observable<T | undefined>;

    abstract write<T = unknown>(key: string, value: T, ttl?: number): void | Observable<void>;

    abstract remove(key: string): void | Observable<void>;

    abstract flush(): void | Observable<void>;
}
