import {Expose} from "class-transformer";

import {SmpResponseMessageBase} from "./smp-response-message-base.interface.js";
import {SmpResponseMessageTypes} from "./smp-response-message-types.enum.js";

export class SmpResponseMessage implements SmpResponseMessageBase {
    @Expose()
    get message(): string {
        return this._message;
    }

    @Expose()
    get type(): SmpResponseMessageTypes {
        return this._type;
    }

    constructor(protected _message: string, protected _type: SmpResponseMessageTypes = SmpResponseMessageTypes.ERROR) {
    }

    static sanitizeMessages(messages: string | SmpResponseMessage | (SmpResponseMessage | string)[]): SmpResponseMessage[] {
        return typeof messages === "string"
            ? messages.length
                ? [new SmpResponseMessage(messages)]
                : []
            : [messages].flat().map((msg: string | SmpResponseMessage) => {
                return typeof msg === "string" ? new SmpResponseMessage(msg) : msg;
            });
    }
}
