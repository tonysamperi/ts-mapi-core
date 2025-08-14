import {SmpBaseJwtTokenPlain} from "./smp-base-jwt-token-plain.interface.js";

export class SmpBaseJwtToken {

    // eslint-disable-next-line @typescript-eslint/naming-convention
    get access_token(): string {
        return this._access_token;
    }

    get exp(): number {
        return this._exp;
    }

    get iss(): string | undefined {
        return this._iss;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    constructor(protected _access_token: string,
                protected _exp: number,
                protected _iss?: string) {
    }

    serialize(): SmpBaseJwtTokenPlain {
        return {
            access_token: this._access_token,
            exp: this._exp,
            iss: this._iss
        };
    }
}
