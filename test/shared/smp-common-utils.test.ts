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

    it("should strip html", () => {
        const input1 = "<strong>Scarpe da corsa</strong>";
        expect(SmpCommonUtils.stripHtml(input1)).toBe("Scarpe da corsa");

        const input2 = "Prezzo: &euro;29,99 &amp; spedizione gratuita";
        expect(SmpCommonUtils.stripHtml(input2)).toBe("Prezzo: €29,99 & spedizione gratuita");

        const input3 = "<div><p>Testo <span>con</span> molti <em>tag</em></p></div>";
        expect(SmpCommonUtils.stripHtml(input3)).toBe("Testo con molti tag");

        const input4 = "Testo con&nbsp;spazio&nbsp;fisso";
        expect(SmpCommonUtils.stripHtml(input4)).toBe("Testo con spazio fisso");

        const input5 = "<p>Testo con tag <br sporco e non chiuso";
        expect(SmpCommonUtils.stripHtml(input5)).toContain("Testo con tag");

        const input6 = "<a href=\"https://example.com\" title=\"Link\">Clicca qui</a>";
        expect(SmpCommonUtils.stripHtml(input6)).toBe("Clicca qui");

        const input7 = "<span>Ciao</span><span>Mondo</span>";
        expect(SmpCommonUtils.stripHtml(input7)).toBe("CiaoMondo");

        const input8 = "<p>Qualità ed estetica</p>";
        expect(SmpCommonUtils.stripHtml(input8)).toBe("Qualità ed estetica");

        expect(SmpCommonUtils.stripHtml("")).toBe("");
        expect(() => {
            // @ts-expect-error we're testing an error scenario
            SmpCommonUtils.stripHtml(null);
        }).toThrow();

        const input9 = `
      <div>
        Testo su 
        più righe
      </div>`;
        expect(SmpCommonUtils.stripHtml(input9).trim()).toBe("Testo su più righe");
    });
});
