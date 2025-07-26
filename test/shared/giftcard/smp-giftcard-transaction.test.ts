import {SmpGiftcardTransaction} from "../../../src/shared/giftcard/smp-giftcard-transaction.class";
import {SmpGiftcardTransactionOps} from "../../../src/shared/giftcard/smp-giftcard-transaction-ops.enum";
import {SmpCommonUtils} from "../../../src/shared/utils/smp-common-utils.class";

describe("SmpGiftcardTransaction", () => {

    const _ctx = {
        transactions: [
            [new SmpGiftcardTransaction("EPA9801591509522", SmpGiftcardTransactionOps.PURCHASE), "pheip0ymzETYKwhwHHIc2shjfgdNdW41Fm+518XwL32mRSVxbQaC2iKyrllc17SGpLgm69yis+xok7H2XHGNZg=="],
        ] as [SmpGiftcardTransaction, string][]
    };


    it("should generate AES transaction", () => {
        for (const [transaction, expectedEncrypted] of _ctx.transactions) {

            const encrypted = transaction.toString();
            expect(encrypted).toBeDefined();
            // expect(encrypted).toBe(expectedEncrypted); // Can never test this cause the timestamp makes it impossible to foresee
        }
    });

    it("should decrypt AES transaction", () => {
        for (const [transaction, expectedEncrypted] of _ctx.transactions) {

            const parsed = SmpGiftcardTransaction.parse(expectedEncrypted);
            const serialized = SmpCommonUtils.omit(parsed.serialize(), ["ts"]);
            const expectedSerialized = SmpCommonUtils.omit(transaction.serialize(), ["ts"]);
            expect(serialized).toBeDefined();
            expect(serialized).toEqual(expectedSerialized);
        }
    });
});
