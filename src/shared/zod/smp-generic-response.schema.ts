import {z, ZodTypeAny} from "zod";
//
import {SmpGenericResponseBase} from "../api/smp-generic-response-base.interface.js";
import {smpResponseMessageSchema} from "./smp-response-message.schema.js";

export const smpGenericResponseSchema = z.object({
    data: z.unknown().optional(),
    messages: z.array(smpResponseMessageSchema).optional()
} as Record<keyof SmpGenericResponseBase, ZodTypeAny>);
