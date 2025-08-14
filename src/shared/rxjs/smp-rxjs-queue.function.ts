import {map, Observable, of, defer, switchMap} from "rxjs";

function smpRxjsSequence<T extends any[]>(steps: { [K in keyof T]: () => Observable<T[K]> }): Observable<T> {
    const results: Partial<T>[] = [];

    function runStep(index: number): Observable<T> {
        if (index >= steps.length) {
            return of(results as T);
        }

        return defer(() => steps[index]()).pipe(
            switchMap((value) => {
                results[index] = value;
                return runStep(index + 1);
            })
        );
    }

    return runStep(0);
}

// Overloads for array or object input
type ObsFnMap = Record<string, () => Observable<any>>;

export function smpRxjsQueue<T extends any[]>(source: { [K in keyof T]: () => Observable<T[K]> }): Observable<T>;
export function smpRxjsQueue<T extends ObsFnMap>(source: T): Observable<{ [K in keyof T]: T[K] extends () => Observable<infer U> ? U : never }>;
export function smpRxjsQueue(
    source: (() => Observable<any>)[] | ObsFnMap
): Observable<any> {
    if (Array.isArray(source)) {
        // use a strongly typed sequence for the array of steps
        return smpRxjsSequence(source as any);
    }
    else {
        // for object, convert values, then reconstruct object mapping with correct types
        const keys = Object.keys(source);
        const stepsArray = keys.map((key) => source[key]);

        return smpRxjsSequence(stepsArray as any).pipe(
            map((results: any[]) => {
                const acc: any = {};
                keys.forEach((key, i) => {
                    acc[key] = results[i];
                });
                return acc;
            })
        );
    }
}


