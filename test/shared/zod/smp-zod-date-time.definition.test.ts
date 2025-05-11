import {DateTime} from "ts-luxon";
import z from "zod";
//
import {smpZodDateTime} from "../../../src/shared/zod/smp-zod-date-time.definition";

// Coercion to DateTime
const coerceToDateTime = (input: any): DateTime | null => {
    if (typeof input === "string") {
        return DateTime.fromJSDate(new Date(input));
    }
    if (typeof input === "number") {
        return DateTime.fromMillis(input);
    }
    return null;
};

// Old implementation of the Zod DateTime definition
export const smpZodDateTimeOriginal = ({coerce}: { coerce?: boolean } = {}) => {
    const baseSchema = z.custom<DateTime>((data) => {
        return DateTime.isDateTime(data) && data.isValid;
    }, {
        message: "Invalid DateTime"
    });

    if (!coerce) {
        return baseSchema;
    }

    return z.preprocess((arg) => {
        if (arg instanceof DateTime && arg.isValid) {
            return arg;
        }
        const dateTime = coerceToDateTime(arg);
        if (dateTime && dateTime.isValid) {
            return dateTime;
        }
        return arg;
    }, baseSchema);
};

describe("smpZodDateTime", () => {
    const now = DateTime.utc();
    const today = now.startOf("day");
    const tomorrow = today.plus({days: 1});
    const yesterday = today.minus({days: 1});

    it("parses a valid DateTime without coercion", () => {
        const schema = smpZodDateTime();
        const result = schema.safeParse(now);
        expect(result.success).toBe(true);
        expect(result.success && result.data.equals(now)).toBe(true);
    });

    it("rejects non-DateTime input without coercion\"", () => {
        const schema = smpZodDateTime();
        expect(schema.safeParse("2023-10-26").success).toBe(false);
        expect(schema.safeParse(new Date()).success).toBe(false);
        expect(schema.safeParse(1698307200000).success).toBe(false);
        expect(schema.safeParse(null).success).toBe(false);
        expect(schema.safeParse(undefined).success).toBe(false);
        expect(schema.safeParse({}).success).toBe(false);
    });

    it("coerces from ISO string to UTC DateTime", () => {
        const iso = now.toISO();
        const schema = smpZodDateTime({coerce: true});
        const result = schema.safeParse(iso);
        expect(result.success).toBe(true);
        expect(result.success && result.data.equals(DateTime.fromISO(iso!))).toBe(true);
    });

    it("coerces from timestamp to UTC DateTime", () => {
        const millis = now.toMillis();
        const schema = smpZodDateTime({coerce: true});
        const result = schema.safeParse(millis);
        expect(result.success).toBe(true);
        expect(result.success && result.data.toMillis()).toBe(millis);
    });

    it("coerces from Date object to UTC DateTime", () => {
        const date = now.toJSDate();
        const schema = smpZodDateTime({coerce: true});
        const result = schema.safeParse(date);
        expect(result.success).toBe(true);
        expect(result.success && result.data.toMillis()).toBe(
            DateTime.fromJSDate(date).toUTC().toMillis()
        );
    });

    it("applies min() correctly", () => {
        const schema = smpZodDateTime().min(today);
        const result = schema.safeParse(yesterday);
        expect(result.success).toBe(false);
    });

    it("applies max() correctly", () => {
        const schema = smpZodDateTime().max(today);
        const result = schema.safeParse(tomorrow);
        expect(result.success).toBe(false);
    });

    it("applies between() correctly", () => {
        const schema = smpZodDateTime().between(today, tomorrow);
        const within = today.plus({hours: 12});
        const result = schema.safeParse(within);
        expect(result.success).toBe(true);
    });

    it("refine: exclude sundays", () => {
        const sunday = today.set({weekday: 7});
        const schema = smpZodDateTime().refine(dt => dt.weekday !== 7, {
            message: "Sunday excluded"
        });
        const result = schema.safeParse(sunday);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe("Sunday excluded");
        }
    });
});

describe("smpZodDateTime vs smpZodDateTimeOriginal", () => {
    const maxDto = DateTime.now().plus({days: 2});
    const minDto = DateTime.now().minus({days: 2});
    const originalImplSchema = smpZodDateTimeOriginal({coerce: !0})
        .refine((data) => data <= maxDto, {
            message: `DateTime must be less than or equal to ${maxDto.toISO()}`
        })
        .refine((data) => data >= minDto, {
            message: `DateTime must be greater than or equal to ${minDto.toISO()}`
        });
    const newImplSchema = smpZodDateTime().coerce().min(minDto).max(maxDto);

    it("applies min() and max() equally", () => {
        const compareToDto = DateTime.now();
        const resultOriginal = originalImplSchema.safeParse({
            date: compareToDto
        });
        const resultNew = newImplSchema.safeParse({
            date: compareToDto
        });

        expect(resultOriginal.success).toBe(resultNew.success);
    });
});
