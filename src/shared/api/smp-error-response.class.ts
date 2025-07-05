import {Expose, plainToInstance} from "class-transformer";
//
import {SmpErrorResponseCreateOpts} from "./smp-error-response-build-opts.interface.js";
import {SmpGenericResponseBase} from "./smp-generic-response-base.interface.js";
import {SmpGenericResponse} from "./smp-generic-response.class.js";
import {SmpResponseMessage} from "./smp-response-message.class.js";

export class SmpErrorResponse<T = any> extends SmpGenericResponse<T, SmpGenericResponseBase & Pick<SmpErrorResponse, "errorCode" | "timestamp" | "status">> {

    static get DEFAULT_MESSAGES() {
        return [new SmpResponseMessage("GENERIC_ERROR")];
    }

    @Expose()
    get errorCode(): number | string {
        return this._errorCode;
    }

    get status(): number {
        return this._status;
    }

    @Expose()
    get timestamp(): number {
        return this._timestamp;
    }

    protected _timestamp: number = Date.now();

    constructor(messages: SmpResponseMessage[] = SmpErrorResponse.DEFAULT_MESSAGES,
                protected _errorCode: number | string = "GENERIC_ERROR",
                protected _status: number = 500,
                data?: T) {
        super(messages, data);
    }

    static create<T>({
                         messages = SmpErrorResponse.DEFAULT_MESSAGES,
                         ...opts
                     }: Partial<SmpErrorResponseCreateOpts<T>> = {}): SmpErrorResponse {
        return new SmpErrorResponse<T>(
            SmpResponseMessage.sanitizeMessages(messages),
            opts.errorCode,
            opts.status,
            opts.data
        );
    }

    /**
     * This shouldn't be necessary, but it's a workaround for this bug https://github.com/typestack/class-transformer/issues/1807
     * @param plain
     */
    static fromPlain(plain: unknown) {
        const tempInstance = plainToInstance(SmpErrorResponseMutable, plain, {
            excludePrefixes: ["_"]
        });
        const instance = new SmpErrorResponse();
        Object.getOwnPropertyNames(tempInstance).forEach((key) => {
            if (key in instance) {
                (instance as any)[key] = (tempInstance as any)[key];
            }
        });

        return instance;
    }
}

class SmpErrorResponseMutable extends SmpErrorResponse {
    set errorCode(value: number | string) {
        this._errorCode = value;
    }

    set status(value: number) {
        this._status = value;
    }

    set timestamp(newValue: number) {
        this._timestamp = newValue;
    }
}
