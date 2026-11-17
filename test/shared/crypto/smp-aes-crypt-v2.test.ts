import {SmpAesCryptV2} from "../../../src/shared/crypto/smp-aes-crypt-v2.class";

describe("SmpAesCryptV2", () => {

    const password = "test-secret";
    const salt = "00112233445566778899aabbccddeeff";
    const iv = "ffeeddccbbaa99887766554433221100";

    it("should encrypt and decrypt with the same interface as SmpAesCrypt", () => {
        const crypt = new SmpAesCryptV2(password, salt, iv);
        const plain = JSON.stringify({
            foo: "bar",
            nested: !0
        });

        const encrypted = crypt.encryptAES(plain);

        expect(typeof encrypted).toBe("string");
        expect(encrypted.length).toBeGreaterThan(0);
        expect(crypt.decryptAES(encrypted)).toBe(plain);
    });

    it("should produce deterministic ciphertext when salt and iv are fixed", () => {
        const crypt = new SmpAesCryptV2(password, salt, iv);

        expect(crypt.encryptAES("plain")).toBe(crypt.encryptAES("plain"));
    });
});
