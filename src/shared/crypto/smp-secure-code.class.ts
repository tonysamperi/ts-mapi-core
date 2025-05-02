import {Hex, MD5, Utf8} from "@tonysamperi/krypto";
//
import {SmpHttpStatusCodes} from "../../services/http/smp-http-status-code.enum.js";
import {SmpErrorResponse} from "../api/smp-error-response.class.js";

/**
 * Util to generate predictable secure codes based on a base serial
 */
export class SmpSecureCode {

    get baseCode(): string {
        return this._baseCode;
    }

    get secureCode(): string {
        return this._encode();
    }

    protected _crcLength: number = 5;
    protected _seed: string = "changeme";

    constructor(protected _baseCode: string) {
    }

    static check<T extends string>(giftcardCode: string, pinToVerify: T): asserts giftcardCode is T {
        if (new this(giftcardCode).secureCode === pinToVerify) {
            return;
        }

        throw SmpErrorResponse.build(
            "WRONG_SECURE_CODE",
            "WRONG_SECURE_CODE",
            SmpHttpStatusCodes.BadRequest
        );
    }

    protected _encode(): string {
        const hmac = new MD5();

        hmac.update(Utf8.parse(this._seed + this._baseCode));
        const hash = hmac.finalize();

        return hash.toString(Hex).substring(0, this._crcLength).toUpperCase();
    }
}
