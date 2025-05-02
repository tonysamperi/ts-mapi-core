import { SmpResponseMessageBase } from "./smp-response-message-base.interface.js";

export interface SmpGenericResponseBase<T = any> {
  data?: T;
  messages: SmpResponseMessageBase[] | void;
}
