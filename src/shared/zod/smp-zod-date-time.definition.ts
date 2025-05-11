import z, {ZodTypeDef, ZodIssueCode, ParseInput, ParseContext, ParseReturnType, ZodParsedType} from "zod";
import {DateTime} from "ts-luxon";

interface SmpZodDateTimeCheck {
    kind: "min" | "max" | "between";
    min?: DateTime;
    max?: DateTime;
    message?: string;
}

interface SmpZodDateTimeDef extends ZodTypeDef {
    coerce: boolean;
    checks: SmpZodDateTimeCheck[];
    typeName: "SmpZodDateTime";
}

export class SmpZodDateTime extends z.ZodType<DateTime, SmpZodDateTimeDef> {
    // Constructor and other methods (between, coerce, max, min, _coerceToDateTime) remain the same as your latest version or my previous suggestions.
    // For brevity, only _parse is shown fully modified here. Ensure other parts of the class are consistent.

    constructor(def?: Partial<SmpZodDateTimeDef>) {
        super({
            typeName: "SmpZodDateTime",
            coerce: def?.coerce ?? false,
            checks: def?.checks ?? []
        });
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    _parse(input: ParseInput): ParseReturnType<DateTime> {
        const ctx = this._getOrReturnCtx(input);
        let val = ctx.data;

        if (this._def.coerce) {
            val = this._coerceToDateTime(val); // Assuming _coerceToDateTime is implemented
            if (!(val instanceof DateTime) || !val.isValid) {
                z.addIssueToContext(ctx, { // Changed from ctx.addIssue
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.date, // Using ZodParsedType.date
                    received: ZodParsedType.unknown,
                    path: ctx.path,
                    message: "Invalid date format"
                });
                return z.INVALID;
            }
        }

        // Ensure val is a DateTime object before proceeding with checks if not coercing
        // or if coercion failed to produce a DateTime (though the above check should catch it)
        if (!(val instanceof DateTime) || !val.isValid) {
            // If not coercing, and it's not a valid DateTime, this is an invalid type.
            // This specific case might be implicitly handled if !this._def.coerce means val must already be DateTime.
            // However, adding an explicit check if not coercing can be safer.
            if (!this._def.coerce) {
                z.addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.date, // Or a custom type name if you prefer
                    received: ZodParsedType.unknown, // Or more specific if possible
                    path: ctx.path,
                    message: "Input must be a valid DateTime object"
                });
                return z.INVALID;
            }
            // If coercion was supposed to happen, and we still don't have a valid DateTime,
            // the earlier check inside the `if (this._def.coerce)` block should have caught it.
        }


        const checkMap: Record<SmpZodDateTimeCheck["kind"], (check: SmpZodDateTimeCheck, dateTimeVal: DateTime, parseCtx: ParseContext) => z.ZodIssue | undefined> = {
            min: (check, dateTimeVal, parseCtx) => {
                if (check.min && dateTimeVal < check.min) {
                    return {
                        code: ZodIssueCode.too_small,
                        minimum: check.min.toMillis(), // Changed to number (milliseconds)
                        type: "date",                   // Added type
                        inclusive: true,
                        message: check.message ?? `Date must be ≥ ${check.min.toISODate()}`,
                        path: parseCtx.path
                    };
                }
                return undefined;
            },
            max: (check, dateTimeVal, parseCtx) => {
                if (check.max && dateTimeVal > check.max) {
                    return {
                        code: ZodIssueCode.too_big,
                        maximum: check.max.toMillis(), // Changed to number (milliseconds)
                        type: "date",                   // Added type
                        inclusive: true,                // Added inclusive
                        message: check.message ?? `Date must be ≤ ${check.max.toISODate()}`,
                        path: parseCtx.path
                    };
                }
                return undefined;
            },
            between: (check, dateTimeVal, parseCtx) => {
                if (check.min && check.max && (dateTimeVal < check.min || dateTimeVal > check.max)) {
                    return {
                        code: ZodIssueCode.custom,
                        message: check.message ?? `Date must be between ${check.min.toISODate()} and ${check.max.toISODate()}`,
                        path: parseCtx.path
                        // Optionally, add params for more structured error data:
                        // params: { min: check.min.toISO(), max: check.max.toISO() }
                    };
                }
                return undefined;
            }
        };

        for (const check of this._def.checks) {
            // Ensure val is a DateTime before passing to checkMap functions
            // This is crucial if coercion didn't happen or didn't result in a DateTime.
            // The earlier checks should ideally ensure 'val' is a valid DateTime if it reached this point.
            if (val instanceof DateTime && val.isValid) {
                const issueData = checkMap[check.kind](check, val, ctx);
                if (issueData) {
                    z.addIssueToContext(ctx, issueData); // Changed from ctx.addIssue
                }
            }
            else {
                // This case should ideally be caught earlier (e.g., if not coercing, or if coercion failed)
                // If it reaches here, it implies a logic flaw or an unexpected state.
                // For robustness, you might add a generic invalid_type issue here if 'val' is not a DateTime.
                // However, the checks at the beginning of _parse should prevent this.
            }
        }

        if (ctx.common.issues.length > 0) { // Check ctx.common.issues.length
            return z.INVALID;
        }

        return z.OK(val as DateTime); // Ensure the 'val' returned by OK is typed as DateTime
    }

    between(min: DateTime, max: DateTime, message?: string): this {
        return new SmpZodDateTime({
            ...this._def,
            checks: [...this._def.checks, {kind: "between", min: min.toUTC(), max: max.toUTC(), message}]
        }) as this;
    }

    coerce(): this {
        return new SmpZodDateTime({
            ...this._def,
            coerce: true
        }) as this;
    }

    max(max: DateTime, message?: string): this {
        return new SmpZodDateTime({
            ...this._def,
            checks: [...this._def.checks, {kind: "max", max: max.toUTC(), message}]
        }) as this;
    }

    min(min: DateTime, message?: string): this {
        return new SmpZodDateTime({
            ...this._def,
            checks: [...this._def.checks, {kind: "min", min: min.toUTC(), message}]
        }) as this;
    }

    // Coercion helper function (ensure it's robust as discussed previously)
    private _coerceToDateTime(val: any): DateTime | null {
        if (val instanceof DateTime && val.isValid) {
            return val;  // Already valid DateTime
        }

        const coercionMap: Record<string, () => DateTime | null> = {
            string: () => DateTime.fromJSDate(new Date(val)),
            number: () => DateTime.fromMillis(val),
            object: () => DateTime.fromJSDate(val),
            default: () => null
        };

        return (coercionMap[typeof val] || coercionMap.default)();
    }
}

export const smpZodDateTime = (opts: { coerce?: boolean } = {}) => {
    return new SmpZodDateTime({
        coerce: opts.coerce ?? false,
        checks: []
    });
};
