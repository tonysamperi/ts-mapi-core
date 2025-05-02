import {
    aesHelper,
    CBC,
    Hex,
    PBKDF2,
    PKCS7,
    SHA1,
    Utf8,
    WordArray
} from "@tonysamperi/krypto";


// THIS CAN BE SAFELY USED AT FE, FOR TESTING BUT NOT ONLY :)
export class SmpAesCrypt {
    protected get _iv(): WordArray | undefined {
        return this._initVector ? Hex.parse(this._initVector) : void 0;
    }

    protected _mode: typeof CBC = CBC;
    protected _padding: typeof PKCS7 = PKCS7;

    constructor(protected _password: string, protected _salt: string, protected _initVector?: string) {
    }

    /**
     * Decodes some data from a symmetric AES encryption
     * @param {string} data
     * @returns {string}
     */
    decryptAES(data: string): string {
        return aesHelper.decrypt(data, this._buildKey(), {
            iv: this._iv,
            mode: this._mode,
            padding: this._padding
        }).toString(Utf8);
    }

    /**
     * Encodes some data with a symmetric AES encryption
     * @param {string} data
     * @returns {string}
     */
    encryptAES(data: string): string {
        return aesHelper.encrypt(data, this._buildKey(), {
            iv: this._iv,
            mode: this._mode,
            padding: this._padding
        }).toString();
    }

    /**
     * This is the default password generation used by Marketing Cloud in their AMPScript
     * @protected
     */
    protected _buildKey(): WordArray {
        return PBKDF2.execute(this._password, Hex.parse(this._salt), {
            keySize: 256 / 32,
            iterations: 1000,
            hasher: SHA1
        });
    }
}
