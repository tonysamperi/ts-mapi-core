import {defaultIfEmpty, filter, Observable, OperatorFunction} from "rxjs";
//
import {smpRxjsThrowIfEmpty} from "./smp-rxjs-throw-if-empty.function.js";

/**
 * Custom RxJS operator that filters the source observable based on a condition
 * and throws an error if the resulting observable is empty.
 *
 * @template T The type of items emitted by the source observable.
 * @param {function(T): boolean} condition - A function that takes a value from the source observable and returns a boolean.
 * If the function returns `true`, the value will be emitted; otherwise, it will be filtered out.
 * @param {function(): Error} [errorFactory] - An optional function that returns an error to be thrown if the resulting observable is empty.
 * If not provided, a default error will be thrown.
 * @returns {OperatorFunction<T, T>} An operator function that can be used in the RxJS pipeline.
 *
 * @example
 * import { of } from 'rxjs';
 * import { kikRxjsThrowOnCondition } from "./path-to-your-file";
 *
 * const source$ = of(1, 5, -3, 7, 12).pipe(
 *   kikRxjsThrowOnCondition(value => value >= 0, () => new Error("Value is less than 0")),
 *   kikRxjsThrowOnCondition(value => value > 12, () => new Error("Value is lower than 12"))
 * );
 *
 * source$.subscribe({
 *   next: value => console.log("Value:", value),
 *   error: err => console.error("Error:", err)
 * });
 */
export function smpRxjsThrowOnCondition<T>(
    condition: (value: T) => boolean,
    errorFactory?: () => any
): OperatorFunction<T, T> {
    return (source: Observable<T>) =>
        source.pipe(
            filter((v: T) => !condition(v)), // Invert the condition because if I need to throw on that condition we should filter all that don't match
            defaultIfEmpty(false as unknown as T), // We nuke type errors, cause when falsy kikRxjsThrowIfEmpty will throw
            smpRxjsThrowIfEmpty(errorFactory)
        );
}
