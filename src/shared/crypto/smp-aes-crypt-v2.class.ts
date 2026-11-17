import {
    aesHelper,
    CBC,
    Hex,
    PBKDF2,
    PKCS7,
    SHA256,
    Utf8,
    WordArray
} from "@tonysamperi/krypto";

// THIS CAN BE SAFELY USED AT FE, FOR TESTING BUT NOT ONLY :)
export class SmpAesCryptV2 {

    protected static readonly _KEY_SIZE = 256 / 32;
    protected static readonly _PBKDF2_ITERATIONS = 100000;

    protected _iv: WordArray | undefined;
    protected _key: WordArray;
    protected _mode: typeof CBC = CBC;
    protected _padding: typeof PKCS7 = PKCS7;

    constructor(protected _password: string, protected _salt: string, protected _initVector?: string) {
        this._iv = this._initVector ? Hex.parse(this._initVector) : void 0;
        this._key = this._buildKey();
    }

    decryptAES(data: string): string {
        return aesHelper.decrypt(data, this._key, {
            iv: this._iv,
            mode: this._mode,
            padding: this._padding
        }).toString(Utf8);
    }

    encryptAES(data: string): string {
        return aesHelper.encrypt(data, this._key, {
            iv: this._iv,
            mode: this._mode,
            padding: this._padding
        }).toString();
    }

    protected _buildKey(): WordArray {
        return PBKDF2.execute(this._password, Hex.parse(this._salt), {
            keySize: SmpAesCryptV2._KEY_SIZE,
            iterations: SmpAesCryptV2._PBKDF2_ITERATIONS,
            hasher: SHA256
        });
    }
}
