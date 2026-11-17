import {SmpHttpStatusCodes, SmpHttpTwoService} from "../../src";

describe("SmpHttpTwoService timeout", () => {
    let fetchSpy: jest.SpyInstance;

    afterEach(() => {
        fetchSpy.mockRestore();
    });

    it("should reject with a request timeout when the timeout expires", async () => {
        fetchSpy = jest.spyOn(globalThis, "fetch").mockImplementation((_url_, opts) => new Promise((_resolve_, reject) => {
            opts?.signal?.addEventListener("abort", () => {
                reject(Object.assign(new Error("The operation was aborted"), {name: "AbortError"}));
            });
        }));

        await expect(SmpHttpTwoService.$http({
            url: "/slow",
            timeout: 10
        })).rejects.toEqual({
            status: SmpHttpStatusCodes.RequestTimeout,
            message: "Request Timeout",
            body: null
        });
    });

    it("should not abort a request completing before the timeout", async () => {
        fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({foo: "bar"}), {status: 200}));

        const response = await SmpHttpTwoService.$http({
            url: "/fast",
            timeout: 30
        });
        // Wait longer than the timeout: the timer must have been cleared
        await new Promise((resolve) => setTimeout(resolve, 60));

        expect(response).toEqual({foo: "bar"});
        expect((fetchSpy.mock.calls[0][1] as RequestInit).signal?.aborted).toBe(!1);
    });

    it("should not set any timer when the timeout is not provided", async () => {
        fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({foo: "bar"}), {status: 200}));
        const setTimeoutSpy = jest.spyOn(globalThis, "setTimeout");

        await SmpHttpTwoService.$http({
            url: "/no-timeout"
        });

        expect(setTimeoutSpy).not.toHaveBeenCalled();
        setTimeoutSpy.mockRestore();
    });
});
