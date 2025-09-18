import {z, ZodTypeAny} from "zod";
//
import {SmpResponseMessage} from "../api/smp-response-message.class.js";
import {SmpResponseMessageTypes} from "../api/smp-response-message-types.enum.js";

export const smpResponseMessageSchema = z.object({
    message: z.string(),
    type: z.nativeEnum(SmpResponseMessageTypes)
} as Record<keyof SmpResponseMessage, ZodTypeAny>);
