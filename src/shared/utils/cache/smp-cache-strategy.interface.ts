export interface SmpCacheStrategy {
    read<T = unknown>(key: string): T | undefined;

    write<T = unknown>(key: string, value: T): void;

    remove(key: string): void;

    flush(): void;
}
