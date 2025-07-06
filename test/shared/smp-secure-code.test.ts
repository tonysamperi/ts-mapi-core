import {SmpSecureCode} from "../../src/shared/crypto/smp-secure-code.class";

describe("SmpGiftcardSecureCode", () => {

    const _ctx = {
        gcs: [
            ["9026000005688202", "C6638"]
        ]
    };

    class KikGiftcardSecureCodeImpl extends SmpSecureCode {

        protected _seed: string = "Percassi1Gift!Card";

        constructor(giftcardCode: string) {
            super(giftcardCode);
        }
    }


    it("should generate the correct PIN", () => {
        for (const [input, output] of _ctx.gcs) {

            const secureCodeObj = new KikGiftcardSecureCodeImpl(input);
            expect(secureCodeObj.secureCode).toEqual(output);
        }
    });
});
