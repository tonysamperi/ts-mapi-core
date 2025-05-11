import {SmpInMemoryCache} from "../../../src/shared/utils/cache";


describe("SmpInMemoryCache - Basic Operations (without TTL)", () => {
    let cache: SmpInMemoryCache;
    beforeAll(() => {
        jest.useFakeTimers();
    });
    afterAll(() => {
        jest.useRealTimers();
    });
    beforeEach(() => {
        cache = new SmpInMemoryCache();
        cache.flush();
        jest.clearAllTimers();
    });

    it("should write and read a value", () => {
        cache.write("testKey1", "testValue1");
        expect(cache.read<string>("testKey1")).toBe("testValue1");
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
    });

    it("should flush the entire cache", () => {
        cache.write("keyA", "valueA");
        cache.write("keyB", "valueB");
        cache.flush();
        expect(cache.read("keyA")).toBeUndefined();
        expect(cache.read("keyB")).toBeUndefined();
    });

    it("should handle different data types", () => {
        cache.write("stringKey", "a string");
        cache.write("numberKey", 123);
        cache.write("booleanKey", true);
        cache.write("objectKey", {a: 1, b: "test"});
        cache.write("arrayKey", [1, 2, 3]);
        cache.write("nullKey", null);
        // Note: undefined as a value itself is usually not stored or makes read return undefined

        expect(cache.read<string>("stringKey")).toBe("a string");
        expect(cache.read<number>("numberKey")).toBe(123);
        expect(cache.read<boolean>("booleanKey")).toBe(true);
        expect(cache.read<{ a: number; b: string }>("objectKey")).toEqual({a: 1, b: "test"});
        expect(cache.read<number[]>("arrayKey")).toEqual([1, 2, 3]);
        expect(cache.read<null>("nullKey")).toBeNull();
    });
});

describe("KikInMemoryCache - TTL Handling", () => {
    let cache: SmpInMemoryCache;
    beforeAll(() => {
        jest.useFakeTimers();
    });
    afterAll(() => {
        jest.useRealTimers();
    });
    beforeEach(() => {
        cache = new SmpInMemoryCache();
        cache.flush();
        jest.clearAllTimers();
    });

    it("should read a value before it expires", () => {
        const ttlSeconds = 5;
        cache.write("ttlKey1", "ttlValue1", ttlSeconds);

        // Avanza il tempo ma meno del TTL
        jest.advanceTimersByTime((ttlSeconds * 1000) - 1);

        expect(cache.read<string>("ttlKey1")).toBe("ttlValue1");
    });

    it("should return undefined for a value after it expires", () => {
        const ttlSeconds = 1;
        cache.write("ttlKey2", "ttlValue2", ttlSeconds);

        // Avanza il tempo oltre il TTL
        jest.advanceTimersByTime(ttlSeconds * 1000 + 1);

        expect(cache.read("ttlKey2")).toBeUndefined();
    });

    it("should remove an expired value when read", () => {
        const ttlSeconds = 1;
        cache.write("ttlKeyToRemove", "valueToRemove", ttlSeconds);

        jest.advanceTimersByTime(ttlSeconds * 1000 + 1);

        expect(cache.read("ttlKeyToRemove")).toBeUndefined();
    });


    it("should not expire a value written without TTL", () => {
        cache.write("noTtlKey", "eternalValue");

        jest.advanceTimersByTime(10 * 60 * 1000);

        expect(cache.read<string>("noTtlKey")).toBe("eternalValue");
    });

    it("should handle overwriting a TTL value with a non-TTL value", () => {
        cache.write("overwriteKey", "initialTTLValue", 1);
        jest.advanceTimersByTime(500);

        cache.write("overwriteKey", "newValueWithoutTTL");

        jest.advanceTimersByTime(1000);

        expect(cache.read<string>("overwriteKey")).toBe("newValueWithoutTTL");

        jest.advanceTimersByTime(10 * 60 * 1000);
        expect(cache.read<string>("overwriteKey")).toBe("newValueWithoutTTL");
    });

    it("should handle overwriting a non-TTL value with a TTL value", () => {
        cache.write("overwriteKeyTTL", "initialValueWithoutTTL");

        cache.write("overwriteKeyTTL", "newValueWithTTL", 1);

        jest.advanceTimersByTime(500);
        expect(cache.read<string>("overwriteKeyTTL")).toBe("newValueWithTTL");

        jest.advanceTimersByTime(1000);
        expect(cache.read("overwriteKeyTTL")).toBeUndefined();
    });
});

