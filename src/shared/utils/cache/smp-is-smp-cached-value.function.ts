import {SmpCachedValue} from "./smp-cached-value.interface";

/**
 * Tells you if a value is a SmpCachedValue
 * @param value
 */
export function smpIsSmpCachedValue<T>(value: unknown): value is SmpCachedValue<T> {
    return (
        typeof value === "object" &&
        value !== null &&
        "value" in value &&
        "expiry" in value &&
        typeof (value as any).expiry === "number"
    );
}
