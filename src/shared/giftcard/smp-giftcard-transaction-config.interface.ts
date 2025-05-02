import {DateTime} from "ts-luxon";
//
import {SmpGiftcardTransactionOps} from "./smp-giftcard-transaction-ops.enum.js";

export interface SmpGiftcardTransactionConfig {
    gc?: string; // Optional cause when issuing a new digital gc we don't have the code
    op: SmpGiftcardTransactionOps;
    ot?: string;
    dto?: DateTime; // Only to build an existing transaction
}
