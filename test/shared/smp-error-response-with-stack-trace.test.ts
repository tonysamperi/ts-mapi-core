import {SmpErrorResponse, SmpErrorResponseWithStackTrace, SmpResponseMessage} from "../../src";

describe("SmpErrorResponseWithStackTrace", () => {

    it("should create an error response carrying the stack trace", () => {
        const response = SmpErrorResponseWithStackTrace.create({
            messages: "SOME_ERROR",
            errorCode: "SOME_CODE",
            status: 400,
            data: {foo: "bar"},
            stackTrace: "Error: boom\n    at somewhere"
        });

        expect(response.stackTrace).toBe("Error: boom\n    at somewhere");
        expect(response.errorCode).toBe("SOME_CODE");
        expect(response.status).toBe(400);
        expect(response.data).toEqual({foo: "bar"});
        expect(response.messages).toEqual([new SmpResponseMessage("SOME_ERROR")]);
    });

    it("should fall back to the default error response values without options", () => {
        const response = SmpErrorResponseWithStackTrace.create();

        expect(response.stackTrace).toBeUndefined();
        expect(response.errorCode).toBe("GENERIC_ERROR");
        expect(response.status).toBe(500);
        expect(response.messages).toEqual(SmpErrorResponse.DEFAULT_MESSAGES);
    });

    it("should still be an error response", () => {
        const response = SmpErrorResponseWithStackTrace.create();

        expect(response).toBeInstanceOf(SmpErrorResponse);
        expect(response.isError()).toBe(!0);
    });
});
