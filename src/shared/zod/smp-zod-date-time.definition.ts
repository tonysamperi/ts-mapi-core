import z, {ZodTypeDef, ZodIssueCode, ParseInput, ParseReturnType, ZodParsedType, type IssueData} from "zod";
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
            val = this._coerceToDateTime(val);
            if (!this._isValidDateTime(val)) {
                z.addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.date,
                    received: ZodParsedType.unknown,
                    message: "Invalid date format"
                });
                return z.INVALID;
            }
        }

        if (!this._isValidDateTime(val)) {
            if (!this._def.coerce) {
                z.addIssueToContext(ctx, {
                    code: ZodIssueCode.invalid_type,
                    expected: ZodParsedType.date,
                    received: ZodParsedType.unknown,
                    message: "Input must be a valid DateTime object"
                });
                return z.INVALID;
            }
        }


        const checkMap: Record<SmpZodDateTimeCheck["kind"], (check: SmpZodDateTimeCheck, dateTimeVal: DateTime) => IssueData | undefined> = {
            min: (check, dateTimeVal) => {
                if (check.min && dateTimeVal.toMillis() < check.min.toMillis()) {
                    return {
                        code: ZodIssueCode.too_small,
                        minimum: check.min.toMillis(),
                        type: "date",
                        inclusive: true,
                        message: check.message ?? `Date must be ≥ ${check.min.toISODate()}`
                    };
                }
                return undefined;
            },
            max: (check, dateTimeVal) => {
                if (check.max && dateTimeVal.toMillis() > check.max.toMillis()) {
                    return {
                        code: ZodIssueCode.too_big,
                        maximum: check.max.toMillis(),
                        type: "date",
                        inclusive: true,
                        message: check.message ?? `Date must be ≤ ${check.max.toISODate()}`
                    };
                }
                return undefined;
            },
            between: (check, dateTimeVal) => {
                if (
                    check.min
                    && check.max
                    && (dateTimeVal.toMillis() < check.min.toMillis() || dateTimeVal.toMillis() > check.max.toMillis())
                ) {
                    return {
                        code: ZodIssueCode.custom,
                        message: check.message ?? `Date must be between ${check.min.toISODate()} and ${check.max.toISODate()}`
                    };
                }
                return undefined;
            }
        };

        for (const check of this._def.checks) {
            if (this._isValidDateTime(val)) {
                const issueData = checkMap[check.kind](check, val);
                if (issueData) {
                    z.addIssueToContext(ctx, issueData);
                }
            }
        }

        if (ctx.common.issues.length > 0) {
            return z.INVALID;
        }

        return z.OK(val);
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

    private _coerceToDateTime(val: unknown): DateTime | null {
        if (this._isValidDateTime(val)) {
            return val;
        }

        if (typeof val === "string") {
            return DateTime.fromISO(val);
        }

        if (typeof val === "number") {
            return DateTime.fromMillis(val);
        }

        if (val instanceof Date) {
            return DateTime.fromJSDate(val).toUTC();
        }

        return null;
    }

    private _isValidDateTime(val: unknown): val is DateTime {
        return DateTime.isDateTime(val) && val.isValid;
    }
}

export const smpZodDateTime = (opts: { coerce?: boolean } = {}) => {
    return new SmpZodDateTime({
        coerce: opts.coerce ?? false,
        checks: []
    });
};
