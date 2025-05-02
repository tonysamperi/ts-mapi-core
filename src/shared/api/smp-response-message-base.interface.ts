import { SmpResponseMessageTypes } from "./smp-response-message-types.enum.js";

export interface SmpResponseMessageBase {
  message: string;
  type: SmpResponseMessageTypes;
}
