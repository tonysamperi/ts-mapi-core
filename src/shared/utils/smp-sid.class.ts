import {DateTime} from "ts-luxon";
//
import {SmpSidRaw} from "./smp-gcpsid-raw.interface.js";

/**
 * A util to generate session ids
 */
export class SmpSid implements SmpSidRaw {

    get active() {
        return this.value.endsWith(this._controlSuffix);
    }

    get expired() {
        return DateTime.now().ts > this.expiry;
    }

    get valid() {
        return !this.expired;
    }

    protected _controlSuffix: string = "$1";

    constructor(public value: string = `gcpsid-xxxx-${+DateTime.now().ts}`,
                public expiry: number = 0) {
    }


    static parse(raw: SmpSidRaw): SmpSid {

        return new SmpSid(raw.value, raw.expiry);
    }

    toPlain(): SmpSidRaw {
        return {
            value: this.value,
            expiry: this.expiry
        };
    }
}
