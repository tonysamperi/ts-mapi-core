import {Observable, OperatorFunction, catchError, throwError} from "rxjs";
import type {ObservableInput, ObservedValueOf} from "rxjs";

export function smpRxjsCatchOnly<T, E extends Error, O extends ObservableInput<any>>(
    errorFilter: (new (...args: any[]) => E) | ((err: unknown) => boolean),
    selector: (err: E) => O
): OperatorFunction<T, T | ObservedValueOf<O>> {
    return (source: Observable<T>) =>
        source.pipe(
            catchError((err: unknown) => {
                const matches = typeof errorFilter === typeof isNaN
                    ? isConstructor(errorFilter)
                        ? isExactInstance(err, errorFilter as new (...args: any[]) => E)
                        : (errorFilter as (err: unknown) => boolean)(err)
                    : false;

                if (matches) {
                    return selector(err as E);
                }
                return throwError(() => err);
            })
        );
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function isConstructor(fn: unknown): fn is Function {
    try {
        // try creating a dummy instance
        Reflect.construct(String, [], fn as any);
        return true;
    }
    catch {
        return false;
    }
}

// Ensures that the error is an *exact* instance of the given error constructor, not a subclass
function isExactInstance<E extends Error>(err: unknown, ctor: new (...args: any[]) => E): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        err.constructor === ctor
    );
}
