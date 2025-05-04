import {Observable, OperatorFunction, catchError, throwError} from "rxjs";
import type {ObservableInput, ObservedValueOf} from "rxjs";

export function smpRxjsCatchOnly<T, E extends Error, O extends ObservableInput<any>>(
    errorType: new (...args: any[]) => E,
    selector: (err: E) => O
): OperatorFunction<T, T | ObservedValueOf<O>> {
    return (source: Observable<T>) =>
        source.pipe(
            catchError((err: unknown) => {
                if (err instanceof errorType) {
                    return selector(err as E);
                }
                return throwError(() => err);
            })
        );
}
