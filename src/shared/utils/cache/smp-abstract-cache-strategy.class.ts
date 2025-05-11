export abstract class SmpAbstractCacheStrategy {
    abstract read<T = unknown>(key: string): T | undefined;

    abstract write<T = unknown>(key: string, value: T, ttl?: number): void;

    abstract remove(key: string): void;

    abstract flush(): void;
}
