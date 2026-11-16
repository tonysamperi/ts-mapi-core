import {SmpRegularExpressions} from "../../src/shared/utils/smp-regular-expressions.class";

describe("SmpRegularExpressions", () => {

    describe("NO_HTML", () => {
        it.each([
            "",
            "Mario",
            "Anna Maria",
            "D'Angelo-Rossi"
        ])("should accept %j", (value) => {
            expect(SmpRegularExpressions.NO_HTML.test(value)).toBe(!0);
        });

        it.each([
            "<b>Mario</b>",
            "a<b",
            "a>b",
            "<script>alert(1)</script>"
        ])("should reject %j", (value) => {
            expect(SmpRegularExpressions.NO_HTML.test(value)).toBe(!1);
        });
    });
});
