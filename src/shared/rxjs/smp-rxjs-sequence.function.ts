import {concatMap, from, Observable, toArray} from "rxjs";

/**
 * Old version of the sequence. Now rewritten using recursion, which is way faster.
 * But you can use this if you want to stick with the rxjs pattern.
 * Use smpRxjsQueue for better performance ;)
 * @param steps
 */
export function smpRxjsSequence<T = any>(steps: (() => Observable<T>)[]) {
    return from(steps).pipe(
        concatMap(step => step()),
        toArray()
    );
}
