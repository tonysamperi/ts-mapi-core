import {SmpCrypto} from "../../../src/shared/crypto/smp-crypto.class";

describe("SmpCrypto", () => {

    it("should generate a well formed UUID v4", () => {
        expect(SmpCrypto.generateUuidV4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it("should generate a different UUID v4 on each call", () => {
        expect(SmpCrypto.generateUuidV4()).not.toBe(SmpCrypto.generateUuidV4());
    });
});
