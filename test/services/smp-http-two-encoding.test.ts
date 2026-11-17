/** @jest-environment setup-polly-jest/jest-environment-node */
import {SmpHttpTwoService} from "../../src";

describe("SmpHttpTwoServiceEncoding", () => {
    const base = "http://localhost:8080/";

    it("should merge query params correctly", async () => {
        const url = SmpHttpTwoService.mergeQueryParams("http://localhost:8080?foo=1&bar=2", {
            goo: "3",
            car: "4"
        });

        expect(url).toBe("http://localhost:8080/?foo=1&bar=2&goo=3&car=4");
    });

    it("should handle relative urls with query params", async () => {
        const url = SmpHttpTwoService.mergeQueryParams("/?foo=1&bar=2", {
            goo: "3",
            car: "4"
        });

        expect(url).toBe("/?foo=1&bar=2&goo=3&car=4");
    });

    it("should urlencode query params", async () => {
        const encoded = "ops458YCrknSc%2FbulWmzjbjq%2BSpqjkwLJzglh4zeLu8%3D";
        const plain = "ops458YCrknSc/bulWmzjbjq+SpqjkwLJzglh4zeLu8=";
        const url = SmpHttpTwoService.mergeQueryParams(`http://localhost:8080`, {
            EmailAddress: plain
        });

        expect(url).toContain(`EmailAddress=${encoded}`);
    });

    it("should overwrite existing keys when merging", () => {
        const url = SmpHttpTwoService.mergeQueryParams(`${base}?foo=1`, {foo: "2"});
        expect(url).toBe(`${base}?foo=2`);
    });

    it("should handle array params like arrayFormat=repeat", () => {
        const url = SmpHttpTwoService.mergeQueryParams(base, {tags: ["a", "b", "c"]});
        expect(url).toBe(`${base}?tags=a&tags=b&tags=c`);
    });

    it("should ignore null and undefined values", () => {
        const url = SmpHttpTwoService.mergeQueryParams(base, {
            // @ts-expect-error - testing null and undefined values
            a: null,
            // @ts-expect-error - testing null and undefined values
            b: undefined,
            c: "ok"
        });
        expect(url).toBe(`${base}?c=ok`);
    });

    it("should handle boolean and numeric values", () => {
        const url = SmpHttpTwoService.mergeQueryParams(base, {
            active: false,
            count: 42
        });
        expect(url).toBe(`${base}?active=false&count=42`);
    });

    it("should handle relative URLs correctly", () => {
        const relative = "/api/test?foo=1";
        const url = SmpHttpTwoService.mergeQueryParams(relative, {bar: "2"});
        expect(url).toBe("/api/test?foo=1&bar=2");
    });

    it("should not append ? if queryParams is empty", () => {
        const url = SmpHttpTwoService.mergeQueryParams(base, {});
        expect(url).toBe(base);
    });

    it("should handle special characters safely", () => {
        const special = "a b+c@#?/&";
        const url = SmpHttpTwoService.mergeQueryParams(base, {q: special});
        expect(url).toBe(`${base}?q=a%20b%2Bc%40%23%3F%2F%26`);
    });

    it("should preserve existing encoded values", () => {
        const alreadyEncoded = "value%20with%20spaces";
        const url = SmpHttpTwoService.mergeQueryParams(`${base}?encoded=${alreadyEncoded}`, {
            another: "yes"
        });
        expect(url).toBe(`${base}?encoded=value%20with%20spaces&another=yes`);
    });

});
