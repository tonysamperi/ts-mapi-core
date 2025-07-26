import {map, Observable, of, defer, switchMap} from "rxjs";

function smpRxjsSequence<T>(steps: (() => Observable<T>)[]): Observable<T[]> {
    const results: T[] = [];

    const runStep = (index: number): Observable<T[]> => {
        if (index >= steps.length) {
            return of(results);
        }

        return defer(() => steps[index]()).pipe(
            switchMap((value) => {
                results.push(value);
                return runStep(index + 1);
            })
        );
    };

    return runStep(0);
}

type ObsFnMap = Record<string, () => Observable<any>>;

/**
 * Processes a queue of RxJS Observables sequentially, either as an array or a mapped object.
 *
 * @param {(() => Observable<T>)[] | Record<string, () => Observable<T>>} source
 * A source of Observables to be processed in sequence. It can either be:
 * - An array of functions returning Observables.
 * - An object where keys are mapped to functions returning Observables.
 *
 * @return {Observable<any>}
 * An Observable that emits the combined results of the processed Observables. If the input is an array,
 * the output is an array of results. If the input is an object, the output is an object with the same keys containing the results.
 */
export function smpRxjsQueue<T extends (() => Observable<any>)[]>(
    source: T
): Observable<{ [K in keyof T]: T[K] extends () => Observable<infer U> ? U : never }>;
export function smpRxjsQueue<T extends ObsFnMap>(
    source: T
): Observable<{ [K in keyof T]: T[K] extends () => Observable<infer U> ? U : never }>;
export function smpRxjsQueue<T>(
    source: (() => Observable<T>)[] | ObsFnMap
): Observable<any> {
    if (Array.isArray(source)) {
        return smpRxjsSequence(source).pipe(
            map((results) => results as any) // Type assertion per array di tuple
        );
    }

    return smpRxjsSequence(Object.values(source)).pipe(
        map((results) =>
            Object.keys(source).reduce((acc, key, index) => {
                acc[key] = results[index];
                return acc;
            }, {} as Record<string, any>)
        )
    );
}
