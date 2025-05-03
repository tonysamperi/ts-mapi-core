import {Expose, plainToInstance} from "class-transformer";
//
import {SmpErrorResponseCreateOpts} from "./smp-error-response-build-opts.interface";
import {SmpGenericResponseBase} from "./smp-generic-response-base.interface";
import {SmpGenericResponse} from "./smp-generic-response.class";
import {SmpResponseMessage} from "./smp-response-message.class";

function getDefaultMessages() {
    return [new SmpResponseMessage("GENERIC_ERROR")];
}

export class SmpErrorResponse<T = any> extends SmpGenericResponse<T, SmpGenericResponseBase & Pick<SmpErrorResponse, "errorCode" | "timestamp" | "status">> {

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

    constructor(messages: SmpResponseMessage[] = getDefaultMessages(),
                protected _errorCode: number | string = "GENERIC_ERROR",
                protected _status: number = 500,
                data?: T) {
        super(messages, data);
    }

    /**
     * @deprecated
     * @see SmpErrorResponse.create
     */
    static build<T>(
        messages: SmpErrorResponseCreateOpts<any>["messages"] = getDefaultMessages(),
        errorCode?: number | string,
        status?: number,
        data?: T
    ): SmpErrorResponse {
        return new SmpErrorResponse<T>(SmpResponseMessage.sanitizeMessages(messages), errorCode, status, data);
    }

    static create<T>({
                         messages = getDefaultMessages(),
                         ...opts
                     }: Partial<SmpErrorResponseCreateOpts<T>>): SmpErrorResponse {
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
