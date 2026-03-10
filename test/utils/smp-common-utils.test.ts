import {SmpCommonUtils} from "../../src/shared/utils/smp-common-utils.class";

describe("SmpCommonUtils", () => {

    const _ctx = {
        assertions: [
            [SmpCommonUtils.assertIsArray, 123],
            [SmpCommonUtils.assertIsBoolean, 123],
            [SmpCommonUtils.assertIsFunction, 123],
            [SmpCommonUtils.assertIsInstance, 123, Object],
            [SmpCommonUtils.assertIsNumber, "foo"],
            [SmpCommonUtils.assertIsNotEmpty, []],
            [SmpCommonUtils.assertIsObject, 123],
            [SmpCommonUtils.assertIsString, 123],
            [SmpCommonUtils.assertIsTruthy, 0]
        ],
        couples: [
            ["foo", "foo"],
            ["FUBAR", "fubar"],
            ["FUBAR", "fubar"],
            ["FU_BAR", "fuBar"],
            ["fu bar", "fuBar"]
        ]
    };

    it("should convert to camel case", () => {
        for (const [input, output] of _ctx.couples) {
            expect(SmpCommonUtils.toCamelCase(input)).toEqual(output);
        }
    });

    it("should map object keys to camel case", () => {
        const from = {
            foo_bar: "fooBar"
        };
        const to = SmpCommonUtils.mapObjectKeys(from, (key) => SmpCommonUtils.toCamelCase(key));
        expect(to).toEqual({
            fooBar: "fooBar"
        });
    });

    it("should handle assertions", () => {
        function drinkOctopus(this: any) {
            // console.debug(`Calling ${this.method}, with ${this.values}`);
            this.method.apply(null, this.values);
        }

        for (const [method, ...values] of _ctx.assertions) {
            expect(drinkOctopus.bind({
                method,
                values
            })).toThrow();
        }
    });

    describe("isEqual", () => {
        it("should return true for identical primitives", () => {
            expect(SmpCommonUtils.isEqual(1, 1)).toBe(true);
            expect(SmpCommonUtils.isEqual("test", "test")).toBe(true);
            expect(SmpCommonUtils.isEqual(true, true)).toBe(true);
            expect(SmpCommonUtils.isEqual(null, null)).toBe(true);
            expect(SmpCommonUtils.isEqual(undefined, undefined)).toBe(true);
        });

        it("should return false for different primitives", () => {
            expect(SmpCommonUtils.isEqual(1, 2)).toBe(false);
            expect(SmpCommonUtils.isEqual("test", "Test")).toBe(false);
            expect(SmpCommonUtils.isEqual(true, false)).toBe(false);
            expect(SmpCommonUtils.isEqual(null, undefined)).toBe(false);
        });

        it("should return true for identical simple objects", () => {
            const obj1 = {a: 1, b: "test"};
            const obj2 = {a: 1, b: "test"};
            expect(SmpCommonUtils.isEqual(obj1, obj2)).toBe(true);
        });

        it("should return false for different simple objects", () => {
            const obj1 = {a: 1, b: "test"};
            const obj2 = {a: 1, b: "Test"};
            expect(SmpCommonUtils.isEqual(obj1, obj2)).toBe(false);
        });

        it("should return true for nested objects with identical structure", () => {
            const obj1 = {a: 1, b: {c: 2, d: {e: 3}}};
            const obj2 = {a: 1, b: {c: 2, d: {e: 3}}};
            expect(SmpCommonUtils.isEqual(obj1, obj2)).toBe(true);
        });

        it("should return false for nested objects with different structure", () => {
            const obj1 = {a: 1, b: {c: 2, d: {e: 3}}};
            const obj2 = {a: 1, b: {c: 2, d: {e: 4}}};
            expect(SmpCommonUtils.isEqual(obj1, obj2)).toBe(false);
        });

        it("should return true for identical arrays", () => {
            const arr1 = [1, 2, 3];
            const arr2 = [1, 2, 3];
            expect(SmpCommonUtils.isEqual(arr1, arr2)).toBe(true);
        });

        it("should return false for different arrays", () => {
            const arr1 = [1, 2, 3];
            const arr2 = [1, 2, 4];
            expect(SmpCommonUtils.isEqual(arr1, arr2)).toBe(false);
        });

        it("should handle arrays of objects", () => {
            const arr1 = [{a: 1}, {b: 2}];
            const arr2 = [{a: 1}, {b: 2}];
            const arr3 = [{a: 1}, {b: 3}];
            expect(SmpCommonUtils.isEqual(arr1, arr2)).toBe(true);
            expect(SmpCommonUtils.isEqual(arr1, arr3)).toBe(false);
        });

        it("should return false for different types", () => {
            expect(SmpCommonUtils.isEqual(1, "1")).toBe(false);
            expect(SmpCommonUtils.isEqual({}, [])).toBe(false);
            expect(SmpCommonUtils.isEqual(null, {})).toBe(false);
        });

        it("should handle functions correctly", () => {
            const fn1 = () => 1;
            const fn2 = () => 1;
            expect(SmpCommonUtils.isEqual(fn1, fn1)).toBe(true); // stessa reference
            expect(SmpCommonUtils.isEqual(fn1, fn2)).toBe(false); // reference diversa
        });

        it("should handle Date objects", () => {
            const date1 = new Date("2025-10-01");
            const date2 = new Date("2025-10-01");
            const date3 = new Date("2025-10-02");
            expect(SmpCommonUtils.isEqual(date1, date2)).toBe(true);
            expect(SmpCommonUtils.isEqual(date1, date3)).toBe(false);
        });

        it("should handle circular references", () => {
            const obj1 = {
                self: undefined as any
            };
            obj1.self = obj1;

            const obj2 = {
                self: undefined as any
            };
            obj2.self = obj2;

            expect(SmpCommonUtils.isEqual(obj1, obj2)).toBe(true);

            const obj3 = {
                self: undefined as any
            };
            obj3.self = obj1;
            expect(SmpCommonUtils.isEqual(obj1, obj3)).toBe(true);
        });

        it("should handle Map and Set", () => {
            const map1 = new Map([["a", 1], ["b", 2]]);
            const map2 = new Map([["a", 1], ["b", 2]]);
            const map3 = new Map([["a", 1], ["b", 3]]);
            expect(SmpCommonUtils.isEqual(map1, map2)).toBe(true);
            expect(SmpCommonUtils.isEqual(map1, map3)).toBe(false);

            const set1 = new Set([1, 2, 3]);
            const set2 = new Set([1, 2, 3]);
            const set3 = new Set([1, 2, 4]);
            expect(SmpCommonUtils.isEqual(set1, set2)).toBe(true);
            expect(SmpCommonUtils.isEqual(set1, set3)).toBe(false);
        });

        it("should fix decimal precision", () => {
            expect(SmpCommonUtils.fixDecimalPrecision(1.005)).toBe(1.01);
            expect(SmpCommonUtils.fixDecimalPrecision(2.675)).toBe(2.68);
            expect(SmpCommonUtils.fixDecimalPrecision(0.1 + 0.2)).toBe(0.3);
            expect(SmpCommonUtils.fixDecimalPrecision(10)).toBe(10);
            expect(SmpCommonUtils.fixDecimalPrecision(9.99)).toBe(9.99);
            expect(SmpCommonUtils.fixDecimalPrecision(1.2345, 3)).toBe(1.235);
            expect(SmpCommonUtils.fixDecimalPrecision(1.2344, 3)).toBe(1.234);
            expect(SmpCommonUtils.fixDecimalPrecision(123.456789, 4)).toBe(123.4568);
            expect(SmpCommonUtils.fixDecimalPrecision(-1.005)).toBe(-1);
            expect(SmpCommonUtils.fixDecimalPrecision(-2.675)).toBe(-2.67);
        });
    });
});

