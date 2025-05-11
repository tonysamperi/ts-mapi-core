import {smpRxjsCatchOnly} from "../../../src/shared/rxjs/smp-rxjs-catch-only.function";
import {catchError, of, throwError} from "rxjs";

class SomeError extends Error {

    constructor(public message: string = "Some error") {
        super();
    }

    static create() {
        return new SomeError();
    }
}

function specificCatchError() {
    return of("Caught a specific error");
}

function finalCatchError() {
    return of("Final catch error");
}

describe("SmpRxjs", () => {

    it("smpRxjsCatchOnly should strictly catch only the error (no match)", (done) => {
        const source$ = throwError(SomeError.create);

        source$.pipe(
            smpRxjsCatchOnly(Error, specificCatchError),
            catchError(finalCatchError)
        ).subscribe({
            next: (value) => {
                expect(value).toEqual("Final catch error");
                done();
            },
            error: (err) => {
                done.fail(`Expected to catch error, but got ${err}`);
            }
        });
    });

    it("smpRxjsCatchOnly should strictly catch only the error (match)", (done) => {
        const source$ = throwError(SomeError.create);

        source$.pipe(
            smpRxjsCatchOnly(SomeError, specificCatchError),
            catchError(finalCatchError)
        ).subscribe({
            next: (value) => {
                expect(value).toEqual("Caught a specific error");
                done();
            },
            error: (err) => {
                done.fail(`Expected to catch error, but got ${err}`);
            }
        });
    });
});
