import {SmpResponseMessage} from "./smp-response-message.class.js";
import {SmpResponseMessageTypes} from "./smp-response-message-types.enum.js";

export interface SmpGenericResponseCreateOpts<T = any> {
    messages: string | SmpResponseMessage | (string | SmpResponseMessage)[];
    data: T;
    type: SmpResponseMessageTypes;
}
