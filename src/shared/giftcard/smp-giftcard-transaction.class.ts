import {MD5, md5Helper, SHA1, sha1Helper, Utf8, WordArray} from "@tonysamperi/krypto";
import {SmpLoggerMethods} from "@tonysamperi/logger";
import {Expose, instanceToPlain, plainToInstance} from "class-transformer";
import {DateTime} from "ts-luxon";
//
import {SmpAesCrypt} from "../crypto/smp-aes-crypt.class";
import {SmpGiftcardTransactionOps} from "./smp-giftcard-transaction-ops.enum.js";
import {SmpGiftcardTransactionPlain} from "./smp-giftcard-transaction-plain.interface.js";
import {SmpGiftcardTransactionConfig} from "./smp-giftcard-transaction-config.interface.js";
import {SmpGiftcardTransactionHashStrategies} from "./smp-giftcard-transaction-hash-strategies.enum.js";

/**
 * Base implementation that you can extend, even customizing the static parts like #KikGiftcardTransaction._AES_ENCODER.
 * You can create your own instance of KikAesCrypt to override it.
 */
export class SmpGiftcardTransaction implements SmpGiftcardTransactionPlain {

    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected static _AES_ENCODER: SmpAesCrypt = new SmpAesCrypt(
        "changeme",
        "5f6eae61d2428b99",
        "d92fbf214e16a79fd36f9a5185ae733f"
    );
    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected static _LOGGER: SmpLoggerMethods = console;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    protected static _OP_CODES: Record<SmpGiftcardTransactionOps, string> = {
        [SmpGiftcardTransactionOps.CHECK]: "", // Doesn't need transaction
        [SmpGiftcardTransactionOps.TRANSACTION]: "", // Doesn't need transaction
        [SmpGiftcardTransactionOps.TRANSACTION_DETAIL]: "", // Doesn't need transaction
        //
        [SmpGiftcardTransactionOps.ACTIVATE]: "A",
        [SmpGiftcardTransactionOps.BLOCK]: "B",
        [SmpGiftcardTransactionOps.DIGITAL_ACTIVATE]: "D",
        [SmpGiftcardTransactionOps.FREEZE]: "F",
        [SmpGiftcardTransactionOps.PURCHASE]: "P",
        [SmpGiftcardTransactionOps.RECHARGE]: "G",
        [SmpGiftcardTransactionOps.ROLLBACK]: "R",
        [SmpGiftcardTransactionOps.UNFREEZE]: "U",
        // CUSTOM
        [SmpGiftcardTransactionOps.XREFUND]: "X"
    };
    protected static readonly _SEP: string = "_";

    get dto(): DateTime {
        return this._dto;
    }

    get hash(): string {
        return this._hashStrategy(this.toString()).toString();
    }

    get iso(): string {
        return this.dto.toUTC().toISO()!;
    }

    @Expose()
    get ts(): number {
        return this._dto.ts;
    }

    /**
     * A DateTime with second precision
     * @protected
     */
    protected _dto: DateTime;
    protected _hashStrategies: Record<SmpGiftcardTransactionHashStrategies, any> = {
        [SmpGiftcardTransactionHashStrategies.MD5]: (string: string) => md5Helper(string),
        [SmpGiftcardTransactionHashStrategies.MD5_HMAC]: (string: string) => {
            const hmac = new MD5();
            hmac.update(Utf8.parse(string));

            return hmac.finalize();
        },
        [SmpGiftcardTransactionHashStrategies.SHA1]: (string: string) => sha1Helper(string),
        [SmpGiftcardTransactionHashStrategies.SHA1_HMAC]: (string: string) => {
            const hmac = new SHA1();
            hmac.update(Utf8.parse(string));

            return hmac.finalize();
        }
    };
    protected _hashStrategy: (str: string) => WordArray = this._hashStrategies[SmpGiftcardTransactionHashStrategies.MD5];

    /**
     *
     * @param gc giftcard code
     * @param op operation
     * @param ot original transaction in case of refund
     * @param unixTimestampOrMilliseconds
     */
    constructor(
        public readonly gc: string = "ACTIVATION", // If we're issuing a digital giftcard we won't have the gc code
        public readonly op: SmpGiftcardTransactionOps,
        public readonly ot?: string,
        unixTimestampOrMilliseconds?: number
    ) {
        this._dto = typeof unixTimestampOrMilliseconds === "number" && unixTimestampOrMilliseconds >= 0
            ? DateTime.fromMillis(+`${unixTimestampOrMilliseconds}000`.slice(0, 13))
            : DateTime.local();
    }

    static build({gc, op, ot, dto}: SmpGiftcardTransactionConfig) {
        return new this(gc, op, ot, dto?.ts);
    }

    /**
     * @deprecated this method is related to the old transactionId format and will be removed in a few months
     * (around September 2024, since we can safely assume that you can refund those transactions for around 1 month,
     * which means by then all new payment transactions will have the new format)
     * @param transactionId
     */
    static explode(transactionId: string) {
        const constructor = (this.constructor as typeof SmpGiftcardTransaction);
        const parts = (transactionId || "").split(constructor._SEP);
        if (parts.length < 4) {
            throw new Error(`INVALID_TRANSACTION "${transactionId}"`);
        }

        return this.build({
            gc: parts[1],
            op: constructor.prefixToOperation(parts[2]),
            dto: DateTime.fromSeconds(+parts[3])
        });
    }

    static isBase64(str: string): boolean {
        const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
        return base64Pattern.test(str) && str.length % 4 === 0;
    }

    static parse(transactionId: string) {
        this._LOGGER.info(`${this.constructor.name}: trying to parse ${transactionId}`);
        try {
            // New transaction format
            if (this.isBase64(transactionId)) {
                const decoded = (this.constructor as typeof SmpGiftcardTransaction)._AES_ENCODER.decryptAES(transactionId);
                const plain = JSON.parse(decoded) as SmpGiftcardTransactionPlain;

                return plainToInstance(this, plain);
            }
            else {
                return this.explode(transactionId);
            }
        }
        catch (e) {
            this._LOGGER.error(`${this.constructor.name}: failed to parse ${transactionId}`, e);
            throw new Error(`UNPARSEABLE "${transactionId}"`);
        }
    }

    static prefixToOperation(prefix: string): SmpGiftcardTransactionOps {
        const entry: [SmpGiftcardTransactionOps, string] = Object.entries(this._OP_CODES).find(([, v]) => v === prefix) as [
            SmpGiftcardTransactionOps,
            string
        ];

        return entry[0];
    }

    serialize(): SmpGiftcardTransactionPlain {
        return instanceToPlain(this, {
            excludePrefixes: ["_"]
        }) as SmpGiftcardTransactionPlain;
    }

    toString(): string {
        const plain = JSON.stringify(this.serialize());

        return (this.constructor as typeof SmpGiftcardTransaction)._AES_ENCODER.encryptAES(plain);
    }
}
