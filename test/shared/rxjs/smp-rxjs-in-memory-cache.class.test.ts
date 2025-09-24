import {firstValueFrom, forkJoin} from "rxjs";
import {SmpRxjsInMemoryCache} from "../../../src/shared/rxjs/";


describe("SmpRxjsInMemoryCache - Basic Operations (without TTL)", () => {
    let cache: SmpRxjsInMemoryCache;
    beforeAll(() => {
        jest.useFakeTimers();
    });
    afterAll(() => {
        jest.useRealTimers();
    });
    beforeEach(() => {
        cache = new SmpRxjsInMemoryCache();
        cache.flush();
        jest.clearAllTimers();
    });

    it("should write and read a value", async () => {
        await firstValueFrom(cache.write("testKey1", "testValue1"));
        const item = await firstValueFrom(cache.read<string>("testKey1"));
        expect(item).toBe("testValue1");
    });

    it("should return undefined for non-existent key", async () => {
        const item = await firstValueFrom(cache.read("nonExistentKey"));
        expect(item).toBeUndefined();
    });

    it("should overwrite an existing value", async () => {
        await firstValueFrom(cache.write("testKey2", "initialValue"));
        await firstValueFrom(cache.write("testKey2", "newValue"));
        const item = await firstValueFrom(cache.read<string>("testKey2"));
        expect(item).toBe("newValue");
    });

    it("should remove a value", async () => {
        await firstValueFrom(cache.write("testKey3", "valueToRemove"));
        await firstValueFrom(cache.remove("testKey3"));
        const item = await firstValueFrom(cache.read("testKey3"));
        expect(item).toBeUndefined();
    });

    it("should flush the entire cache", async () => {
        await firstValueFrom(cache.write("keyA", "valueA"));
        await firstValueFrom(cache.write("keyB", "valueB"));
        await firstValueFrom(cache.flush());
        const itemA = await firstValueFrom(cache.read("keyA"));
        const itemB = await firstValueFrom(cache.read("keyB"));
        expect(itemA).toBeUndefined();
        expect(itemB).toBeUndefined();
    });

    it("should handle different data types", async () => {
        await firstValueFrom(
            forkJoin([
                cache.write("stringKey", "a string"),
                cache.write("numberKey", 123),
                cache.write("booleanKey", true),
                cache.write("objectKey", {a: 1, b: "test"}),
                cache.write("arrayKey", [1, 2, 3]),
                cache.write("nullKey", null)
            ])
        );

        // Note: undefined as a value itself is usually not stored or makes read return undefined
        const itemA = await firstValueFrom(cache.read<string>("stringKey"));
        const itemB = await firstValueFrom(cache.read<number>("numberKey"));
        const itemC = await firstValueFrom(cache.read<boolean>("booleanKey"));
        const itemD = await firstValueFrom(cache.read<{ a: number; b: string }>("objectKey"));
        const itemE = await firstValueFrom(cache.read<number[]>("arrayKey"));
        const itemF = await firstValueFrom(cache.read<null>("nullKey"));

        expect(itemA).toBe("a string");
        expect(itemB).toBe(123);
        expect(itemC).toBe(true);
        expect(itemD).toEqual({a: 1, b: "test"});
        expect(itemE).toEqual([1, 2, 3]);
        expect(itemF).toBeNull();
    });
});

describe("SmpRxjsInMemoryCache - TTL Handling", () => {
    let cache: SmpRxjsInMemoryCache;
    beforeAll(() => {
        jest.useFakeTimers();
    });
    afterAll(() => {
        jest.useRealTimers();
    });
    beforeEach(() => {
        cache = new SmpRxjsInMemoryCache();
        cache.flush();
        jest.clearAllTimers();
    });

    it("should read a value before it expires", async () => {
        const ttlSeconds = 5;
        await firstValueFrom(cache.write("ttlKey1", "ttlValue1", ttlSeconds));

        // Avanza il tempo ma meno del TTL
        jest.advanceTimersByTime((ttlSeconds * 1000) - 1);

        const item = await firstValueFrom(cache.read<string>("ttlKey1"));
        expect(item).toBe("ttlValue1");
    });

    it("should return undefined for a value after it expires", async () => {
        const ttlSeconds = 1;
        await firstValueFrom(cache.write("ttlKey2", "ttlValue2", ttlSeconds));

        // Avanza il tempo oltre il TTL
        jest.advanceTimersByTime(ttlSeconds * 1000 + 1);

        const item = await firstValueFrom(cache.read("ttlKey2"));
        expect(item).toBeUndefined();
    });

    it("should remove an expired value when read", async () => {
        const ttlSeconds = 1;
        await firstValueFrom(cache.write("ttlKeyToRemove", "valueToRemove", ttlSeconds));

        jest.advanceTimersByTime(ttlSeconds * 1000 + 1);

        const item = await firstValueFrom(cache.read("ttlKeyToRemove"));
        expect(item).toBeUndefined();
    });


    it("should not expire a value written without TTL", async () => {
        await firstValueFrom(cache.write("noTtlKey", "eternalValue"));

        jest.advanceTimersByTime(10 * 60 * 1000);

        const item = await firstValueFrom(cache.read<string>("noTtlKey"));
        expect(item).toBe("eternalValue");
    });

    it("should handle overwriting a TTL value with a non-TTL value", async () => {
        await firstValueFrom(cache.write("overwriteKey", "initialTTLValue", 1));
        jest.advanceTimersByTime(500);

        await firstValueFrom(cache.write("overwriteKey", "newValueWithoutTTL"));

        jest.advanceTimersByTime(1000);

        let item = await firstValueFrom(cache.read<string>("overwriteKey"));
        expect(item).toBe("newValueWithoutTTL");

        jest.advanceTimersByTime(10 * 60 * 1000);
        item = await firstValueFrom(cache.read<string>("overwriteKey"));
        expect(item).toBe("newValueWithoutTTL");
    });

    it("should handle overwriting a non-TTL value with a TTL value", async () => {
        await firstValueFrom(cache.write("overwriteKeyTTL", "initialValueWithoutTTL"));

        await firstValueFrom(cache.write("overwriteKeyTTL", "newValueWithTTL", 1));

        jest.advanceTimersByTime(500);
        let item = await firstValueFrom(cache.read<string>("overwriteKeyTTL"));
        expect(item).toBe("newValueWithTTL");

        jest.advanceTimersByTime(1000);
        item = await firstValueFrom(cache.read("overwriteKeyTTL"));
        expect(item).toBeUndefined();
    });
});

