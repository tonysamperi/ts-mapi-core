import {SmpBrowserCache} from "../../../src/shared/utils/cache/smp-browser-cache.class";

const createStorageMock = () => {
    let store: { [key: string]: string } = {};
    return {
        getItem: jest.fn((key: string): string | null => {
            return store[key] === undefined ? null : store[key];
        }),
        setItem: jest.fn((key: string, value: string): void => {
            store[key] = String(value);
        }),
        removeItem: jest.fn((key: string): void => {
            delete store[key];
        }),
        clear: jest.fn((): void => {
            store = {};
        }),
        key: jest.fn((index: number): string | null => {
            const keys = Object.keys(store);
            return keys[index] || null;
        }),
        get length(): number {
            return Object.keys(store).length;
        }
    };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(global, "localStorage", {value: localStorageMock, writable: true});
Object.defineProperty(global, "sessionStorage", {value: sessionStorageMock, writable: true});


describe("KikBrowserCache - Basic Operations (without TTL)", () => {
    let cache: SmpBrowserCache;
    const testPrefix = "test-cache-";

    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        localStorageMock.clear();
        sessionStorageMock.clear();
        cache = new SmpBrowserCache(localStorageMock, testPrefix);
        jest.clearAllTimers();
    });

    it("should write and read a value", () => {
        cache.write("testKey1", "testValue1");
        expect(localStorageMock.setItem).toHaveBeenCalledWith(testPrefix + "testKey1", JSON.stringify("testValue1"));
        expect(cache.read<string>("testKey1")).toBe("testValue1");
        expect(localStorageMock.getItem).toHaveBeenCalledWith(testPrefix + "testKey1");
    });

    it("should return undefined for non-existent key", () => {
        expect(cache.read("nonExistentKey")).toBeUndefined();
    });

    it("should overwrite an existing value", () => {
        cache.write("testKey2", "initialValue");
        cache.write("testKey2", "newValue");
        expect(cache.read<string>("testKey2")).toBe("newValue");
    });

    it("should remove a value", () => {
        cache.write("testKey3", "valueToRemove");
        cache.remove("testKey3");
        expect(cache.read("testKey3")).toBeUndefined();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(testPrefix + "testKey3");
    });

    it("should flush only keys with the configured prefix", () => {
        cache.write("keyA", "valueA"); // With prefix
        localStorageMock.setItem("other-prefix-keyC", JSON.stringify("valueC")); // Without prefix
        cache.write("keyB", "valueB"); // With prefix

        expect(localStorageMock.length).toBe(3); // 2 with prefix, 1 without

        cache.flush();

        expect(localStorageMock.length).toBe(1); // Only the one without prefix should remain
        expect(localStorageMock.getItem("other-prefix-keyC")).toBe(JSON.stringify("valueC"));
        expect(cache.read("keyA")).toBeUndefined(); // Check via cache interface
    });

    it("should handle different data types correctly via JSON", () => {
        cache.write("stringKey", "a string");
        cache.write("numberKey", 123);
        cache.write("booleanKey", true);
        const obj = {a: 1, b: "test", c: [1, {x: 5}]};
        cache.write("objectKey", obj);
        const arr = [1, "hello", false, {z: 99}];
        cache.write("arrayKey", arr);
        cache.write("nullKey", null);
        // Note: undefined values are stringified as "undefined", read might return undefined or "undefined" depending on parse logic
        // The current _readRaw returns undefined if JSON.parse fails or raw is falsy.
        // Test null specifically as it's a valid JSON value.

        expect(cache.read<string>("stringKey")).toBe("a string");
        expect(cache.read<number>("numberKey")).toBe(123);
        expect(cache.read<boolean>("booleanKey")).toBe(true);
        expect(cache.read<typeof obj>("objectKey")).toEqual(obj); // Use toEqual for objects/arrays
        expect(cache.read<typeof arr>("arrayKey")).toEqual(arr);
        expect(cache.read<null>("nullKey")).toBeNull();
    });

    it("should handle JSON parsing errors gracefully on read", () => {
        const badJson = "{ invalid json";
        localStorageMock.setItem(testPrefix + "badKey", badJson);

        // The _readRaw method should catch this and return undefined,
        // and the public read should return undefined as per its logic.
        expect(cache.read("badKey")).toBeUndefined();
    });
});

describe("KikBrowserCache - TTL Handling", () => {
    let cache: SmpBrowserCache;
    const testPrefix = "test-cache-";

    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        localStorageMock.clear();
        sessionStorageMock.clear();
        cache = new SmpBrowserCache(localStorageMock, testPrefix);
        jest.clearAllTimers();
    });

    it("should read a value before it expires", () => {
        const ttlSeconds = 5;
        cache.write("ttlKey1", "ttlValue1", ttlSeconds);

        jest.advanceTimersByTime((ttlSeconds * 1000) - 1); // Meno del TTL

        expect(cache.read<string>("ttlKey1")).toBe("ttlValue1");
    });

    it("should return undefined for a value after it expires", () => {
        const ttlSeconds = 1;
        cache.write("ttlKey2", "ttlValue2", ttlSeconds);

        jest.advanceTimersByTime(ttlSeconds * 1000 + 1); // Oltre il TTL

        expect(cache.read("ttlKey2")).toBeUndefined();
    });

    it("should remove an expired value from storage when read", () => {
        const ttlSeconds = 1;
        const key = "ttlKeyToRemove";
        cache.write(key, "valueToRemove", ttlSeconds);

        // Check it's in the raw storage (as wrapped value)
        const rawKey = testPrefix + key;
        expect(localStorageMock.getItem(rawKey)).not.toBeNull();

        jest.advanceTimersByTime(ttlSeconds * 1000 + 1); // Oltre il TTL

        // Leggi il valore scaduto (dovrebbe essere undefined e innescare la rimozione)
        expect(cache.read(key)).toBeUndefined();

        // Verifica che il metodo raw remove sia stato chiamato
        expect(localStorageMock.removeItem).toHaveBeenCalledWith(rawKey);
        // Verifica che non sia più nel raw storage
        expect(localStorageMock.getItem(rawKey)).toBeNull();
    });

    it("should not expire a value written without TTL", () => {
        cache.write("noTtlKey", "eternalValue");

        jest.advanceTimersByTime(10 * 60 * 1000); // 10 minuti

        expect(cache.read<string>("noTtlKey")).toBe("eternalValue");
    });

    it("should handle overwriting a TTL value with a non-TTL value", () => {
        const key = "overwriteKey";
        cache.write(key, "initialTTLValue", 1);
        jest.advanceTimersByTime(500); // 0.5 seconds passed

        cache.write(key, "newValueWithoutTTL"); // Overwrite without TTL

        jest.advanceTimersByTime(1000); // Another 1 second passed (total 1.5s) - initial TTL should be expired

        // La nuova lettura dovrebbe restituire il valore senza TTL, non scaduto
        expect(cache.read<string>(key)).toBe("newValueWithoutTTL");

        // Avanza ancora per essere sicuri che non scada mai
        jest.advanceTimersByTime(10 * 60 * 1000);
        expect(cache.read<string>(key)).toBe("newValueWithoutTTL");
    });

    it("should handle overwriting a non-TTL value with a TTL value", () => {
        const key = "overwriteKeyTTL";
        cache.write(key, "initialValueWithoutTTL");

        cache.write(key, "newValueWithTTL", 1); // Overwrite with 1 second TTL

        jest.advanceTimersByTime(500); // 0.5 seconds passed
        expect(cache.read<string>(key)).toBe("newValueWithTTL");

        jest.advanceTimersByTime(1000); // Another 1 second passed (total 1.5s) - new TTL should be expired
        expect(cache.read(key)).toBeUndefined();
    });

    // Aggiungi test per TTL 0 o negativi se vuoi specificare il comportamento
    // L'attuale logica `ttl !== undefined && ttl > 0` li tratta come senza TTL.
    it("should treat TTL 0 or negative as no-TTL", () => {
        cache.write("keyTTLZero", "valueZero", 0);
        cache.write("keyTTLNega", "valueNega", -10);

        jest.advanceTimersByTime(1000); // Short time
        expect(cache.read<string>("keyTTLZero")).toBe("valueZero");
        expect(cache.read<string>("keyTTLNega")).toBe("valueNega");

        jest.advanceTimersByTime(10 * 60 * 1000); // Long time
        expect(cache.read<string>("keyTTLZero")).toBe("valueZero");
        expect(cache.read<string>("keyTTLNega")).toBe("valueNega");
    });
});
