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
});
