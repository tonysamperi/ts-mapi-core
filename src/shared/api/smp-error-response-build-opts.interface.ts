import {SmpResponseMessage} from "./smp-response-message.class";

type ResponseMessageUnion = string | SmpResponseMessage;

export interface SmpErrorResponseCreateOpts<T> {
    messages: ResponseMessageUnion | ResponseMessageUnion[];
    errorCode: number | string;
    status: number;
    data: T;
}
