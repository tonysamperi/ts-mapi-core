import {Expose, instanceToPlain, plainToInstance, Transform} from "class-transformer";
//
import {SmpGenericResponseBase} from "./smp-generic-response-base.interface.js";
import {SmpResponseMessage} from "./smp-response-message.class.js";
import {SmpResponseMessageTypes} from "./smp-response-message-types.enum.js";
import {SmpGenericResponseCreateOpts} from "./smp-generic-response-create-opts.interface.js";

export class SmpGenericResponse<T, U = SmpGenericResponseBase> implements SmpGenericResponseBase<T> {

    set messages(newValue: string | SmpResponseMessage | (SmpResponseMessage | string)[]) {
        this._messages = SmpResponseMessage.sanitizeMessages(newValue);
    }

    @Expose()
    @Transform(({value}) => (value?.length ? value : void 0))
    get messages(): SmpResponseMessage[] | void {
        return this._messages;
    }

    constructor(protected _messages: SmpResponseMessage[] = [], public data?: T) {
    }

    static create<T = any>(config: Partial<SmpGenericResponseCreateOpts<T>>): SmpGenericResponse<T> {
        return new SmpGenericResponse<T>(
            [config.messages || []].flat().map((m) => {
                return m instanceof SmpResponseMessage ? m : new SmpResponseMessage(m, config.type || SmpResponseMessageTypes.SUCCESS);
            }),
            config.data
        );
    }

    static fromPlain(plain: unknown) {
        return plainToInstance(SmpGenericResponse, plain);
    }


    isError(): boolean {
        return !this.isSuccess();
    }

    isSuccess(): boolean {
        return typeof (this as any)["_errorCode"] === typeof 0;
    }

    serialize(): U {
        return instanceToPlain(this, {
            excludePrefixes: ["_"]
        }) as U;
    }
}
