import {Base64, md5Helper, sha1Helper, sha256Helper, sha512Helper, Utf8} from "@tonysamperi/krypto";

export class SmpCrypto {

    static base64Decode(str: string): string {
        return Utf8.stringify(Base64.parse(str));
    }

    static base64Encode(str: string): string {
        return Base64.stringify(Utf8.parse(str));
    }

    static md5(data: string): string {
        return md5Helper(data).toString();
    }

    static sha1(data: string): string {
        return sha1Helper(data).toString();
    }

    static sha256(data: string): string {
        return sha256Helper(data).toString();
    }

    static sha512(data: string): string {
        return sha512Helper(data).toString();
    }
}
