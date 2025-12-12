import {DateTime} from "ts-luxon";

export type SmpWithDateTimeAsDate<T, Keys extends keyof T = keyof T> = Omit<T, Keys> & {
    [K in Keys]: T[K] extends DateTime | null | undefined ? Exclude<T[K], DateTime> | Date : T[K];
};
