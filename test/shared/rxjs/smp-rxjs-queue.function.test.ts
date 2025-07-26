import {delay, firstValueFrom, of, tap, throwError} from "rxjs";
//
import {smpRxjsQueue} from "../../../src/shared/rxjs/smp-rxjs-queue.function";

describe("smpRxjsQueue", () => {

    it("should infer types", async () => {
        const steps = [
            () => of("A"),
            () => of(2),
            () => of(true),
            () => of({
                foo: "bar"
            }),
        ];

        smpRxjsQueue(steps).subscribe((r) => {
            console.info("R", r);
        });


    })


    it("should execute steps in sequence", async () => {
        const calls: string[] = [];

        const steps = [
            () => of("A").pipe(delay(10), tap(() => calls.push("A"))),
            () => of("B").pipe(delay(5), tap(() => calls.push("B"))),
            () => of("C").pipe(delay(1), tap(() => calls.push("C")))
        ];

        const result = await firstValueFrom(smpRxjsQueue(steps));
        expect(calls).toEqual(["A", "B", "C"]);
        expect(result).toEqual(["A", "B", "C"]);
    });

    it("should execute steps in sequence w/ map", async () => {
        const calls: string[] = [];

        const steps = {
            c: () => of("C").pipe(delay(25), tap(() => calls.push("C"))),
            a: () => of("A").pipe(delay(10), tap(() => calls.push("A"))),
            b: () => of("B").pipe(delay(1), tap(() => calls.push("B"))),
        };

        const result = await firstValueFrom(smpRxjsQueue(steps));
        expect(calls).toEqual(["C", "A", "B"]);
        expect(result).toEqual({
            c: "C",
            a: "A",
            b: "B"
        });
    });

    it("should work with synchronous observables", async () => {
        const calls: string[] = [];

        const steps = [
            () => of("X").pipe(tap(() => calls.push("X"))),
            () => of("Y").pipe(tap(() => calls.push("Y")))
        ];

        const result = await firstValueFrom(smpRxjsQueue(steps));
        expect(calls).toEqual(["X", "Y"]);
        expect(result).toEqual(["X", "Y"]);
    });

    it("should fail fast on error and stop the sequence", async () => {
        const calls: string[] = [];

        const steps = [
            () => of("1").pipe(tap(() => calls.push("1"))),
            () => throwError(() => new Error("Bang!")),
            () => of("2").pipe(tap(() => calls.push("2")))
        ];

        await expect(smpRxjsQueue(steps).toPromise()).rejects.toThrow("Bang!");
        expect(calls).toEqual(["1"]); // should not reach '2'
    });

    it("should return empty array if no steps provided", async () => {
        const result = await firstValueFrom(smpRxjsQueue([]));
        expect(result).toEqual([]);
    });

    it("should stop the sequence immediately on error and not complete", done => {
        const calls: string[] = [];

        const steps = [
            () => of("step1").pipe(tap(() => calls.push("step1"))),
            () => throwError(() => new Error("Intentional failure")),
            () => of("step2").pipe(tap(() => calls.push("step2"))) // Must not be called
        ];

        smpRxjsQueue(steps).subscribe({
            next: () => {
                // Do nothing since we expect the observable to error
            },
            error: (err: Error) => {
                expect(err).toBeInstanceOf(Error);
                expect(err.message).toBe("Intentional failure");
                expect(calls).toEqual(["step1"]); // step2 must not be there
                done();
            },
            complete: () => {
                done.fail("Should not complete if an error occurs");
            }
        });
    });

});
