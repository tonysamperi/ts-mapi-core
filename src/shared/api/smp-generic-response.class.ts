import {Expose, instanceToPlain, plainToInstance, Transform} from "class-transformer";
//
import {SmpGenericResponseBase} from "./smp-generic-response-base.interface.js";
import {SmpResponseMessage} from "./smp-response-message.class.js";
import {SmpResponseMessageTypes} from "./smp-response-message-types.enum.js";

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

    static buildInfo<T = any>(msg: string | string[], data?: T): SmpGenericResponse<T> {
        return new SmpGenericResponse<T>(
            [msg].flat().map((m) => new SmpResponseMessage(m, SmpResponseMessageTypes.INFO)),
            data
        );
    }

    static buildSuccess<T = any>(msg: string | string [], data?: T): SmpGenericResponse<T> {
        return new SmpGenericResponse<T>(
            [msg].flat().map((m) => new SmpResponseMessage(m, SmpResponseMessageTypes.SUCCESS)),
            data
        );
    }

    static fromPlain(plain: unknown) {
        return plainToInstance(SmpGenericResponse, plain);
    }

    isError(): boolean {
        return !this.isSuccess();
    }

    isSuccess(): boolean {
        return "_errorCode" in this && this._errorCode !== null && this._errorCode !== void 0;
    }

    serialize(): U {
        return instanceToPlain(this, {
            excludePrefixes: ["_"]
        }) as U;
    }
}
