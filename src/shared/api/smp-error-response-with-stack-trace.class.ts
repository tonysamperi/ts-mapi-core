import {SmpErrorResponse} from "./smp-error-response.class.js";
import {SmpErrorResponseCreateOpts} from "./smp-error-response-create-opts.interface.js";
import {SmpResponseMessage} from "./smp-response-message.class.js";

export class SmpErrorResponseWithStackTrace<T = any> extends SmpErrorResponse<T> {

    stackTrace?: string;

    static override create<T>({
                                  messages = SmpErrorResponse.DEFAULT_MESSAGES,
                                  stackTrace,
                                  ...opts
                              }: Partial<SmpErrorResponseCreateOpts<T>> & { stackTrace?: string } = {}): SmpErrorResponseWithStackTrace<T> {
        const instance = new SmpErrorResponseWithStackTrace<T>(
            SmpResponseMessage.sanitizeMessages(messages),
            opts.errorCode,
            opts.status,
            opts.data
        );
        instance.stackTrace = stackTrace;

        return instance;
    }

}
