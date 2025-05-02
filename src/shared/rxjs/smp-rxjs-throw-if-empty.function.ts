import {map, Observable, OperatorFunction} from "rxjs";

/**
 * If the source observable completes emitting an empty value (empty array or object will be considered empty), it will emit
 * an error. The error will be created at that time by the optional
 * `errorFactory` argument, otherwise, the error will be {@link Error}.
 *
 * ## Example
 *
 * Throw an error if the query didn't match anything
 *
 * ```ts
 * import { of, takeUntil, timer, throwIfEmpty } from 'rxjs';
 *
 * const query$ = of([]);
 *
 * query$.pipe(
 *   smpRxjsThrowIfEmpty(() => new Error('The query had no results'))
 * )
 * .subscribe({
 *   next() {
 *    console.log("The query had results");
 *   },
 *   error(err) {
 *     console.error(err.message);
 *   }
 * });
 * ```
 *
 * @param errorFactory A factory function called to produce the
 * error to be thrown when the source observable completes without emitting a
 * value.
 * @return A function that returns an Observable that throws an error if the
 * source Observable completed without emitting.
 */
export function smpRxjsThrowIfEmpty<T>(errorFactory: (value: T) => any = defaultErrorFactory): OperatorFunction<T, T> {
    return (source: Observable<T>) => source.pipe(
        map(v => {
            if (~emptyValues.indexOf(JSON.stringify(v))) {
                throw errorFactory(v);
            }

            return v;
        })
    );
}

const emptyValues = [void 0, null, false, 0, "", "0", [], {}].map((v) =>
    JSON.stringify(v)
);

const defaultErrorFactory = (): Error => new Error();
