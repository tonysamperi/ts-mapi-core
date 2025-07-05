import {Observable} from "rxjs";

export abstract class SmpAbstractCacheStrategy {
    abstract read<T = unknown>(key: string): T | undefined | Observable<T | undefined>;

    abstract write<T = unknown>(key: string, value: T, ttl?: number): void | Observable<void>;

    abstract remove(key: string): void | Observable<void>;

    abstract flush(): void | Observable<void>;
}
