export type SmpDynamicFetchReturn<T, U> = T extends "blob"
    ? Blob
    : T extends "arraybuffer"
        ? ArrayBuffer
        : T extends "text"
            ? string
            : T extends "json"
                ? U
                : T;
