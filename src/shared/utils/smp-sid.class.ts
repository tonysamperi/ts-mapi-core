import {DateTime} from "ts-luxon";
//
import {SmpCachedValue} from "./cache/smp-cached-value.interface.js";

/**
 * A util to generate session ids
 */
export class SmpSid implements SmpCachedValue<string> {

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

    constructor(public value: string = `sid-xxxx-${+DateTime.now().ts}`,
                public expiry: number = 0) {
    }


    static parse(raw: SmpCachedValue<string>): SmpSid {

        return new SmpSid(raw.value, raw.expiry);
    }

    toPlain(): SmpCachedValue<string> {
        return {
            value: this.value,
            expiry: this.expiry
        };
    }
}
