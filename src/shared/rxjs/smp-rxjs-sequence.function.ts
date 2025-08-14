import {concatMap, from, Observable, toArray} from "rxjs";

/**
 * Old version of the sequence. Now rewritten using recursion, which is way faster.
 * But you can use this if you want to stick with the rxjs pattern
 * @param steps
 */
export function smpRxjsSequence<T extends any[]>(
    steps: { [K in keyof T]: () => Observable<T[K]> }
): Observable<T> {
    // Cast to readonly tuple of functions to keep tuple inference
    const stepFunctions = steps as readonly (() => Observable<T[number]>)[];

    return from(stepFunctions).pipe(
        concatMap(step => step()),
        toArray()
        // TS loses tuple typing here, so we cast the result back to T
        // This cast is safe because we control the input and ordering
    ) as Observable<T>;
}
