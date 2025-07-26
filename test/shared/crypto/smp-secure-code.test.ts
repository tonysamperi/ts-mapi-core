import {SmpSecureCode} from "../../../src/shared/crypto/smp-secure-code.class";

describe("SmpGiftcardSecureCode", () => {

    const _ctx = {
        gcs: [
            ["9026000005688202", "6146B"]
        ]
    };

    class KikGiftcardSecureCodeImpl extends SmpSecureCode {

        protected _seed: string = "My!Gift!Card!Secret";

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
