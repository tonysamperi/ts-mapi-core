import {SmpGenericResponse} from "../../src/shared/api/smp-generic-response.class";
import {SmpErrorResponse} from "../../src/shared/api/smp-error-response.class";
import {SmpResponseMessage} from "../../src/shared/api/smp-response-message.class";
import {SmpResponseMessageTypes} from "../../src/shared/api/smp-response-message-types.enum";

class SmpGenericResponseSubclass extends SmpGenericResponse<unknown> {
}

describe("SmpApi", () => {
    it.each([
        {type: "a number", data: 42},
        {type: "a string", data: "hello"},
        {type: "undefined", data: undefined}
    ])("should serialise data when it is $type", ({data}) => {
        const response = SmpGenericResponse.fromPlain({data});

        expect(() => response.serialize()).not.toThrow();

        const serialized = response.serialize();
        expect(Object.prototype.hasOwnProperty.call(serialized, "data")).toBe(true);
        expect(serialized.data).toBe(data);
    });

    it("should create a response instance from plain data", () => {
        const data = {
            __CIAO__: "preserved",
            nested: {
                _private: "also preserved"
            }
        };
        const response = SmpGenericResponse.fromPlain({
            data,
            messages: [{
                message: "Ready",
                type: SmpResponseMessageTypes.SUCCESS
            }]
        });

        expect(response).toBeInstanceOf(SmpGenericResponse);
        expect(response.data).toEqual(data);
        expect(response.messages?.[0]).toBeInstanceOf(SmpResponseMessage);
        expect(response.messages?.[0]).toMatchObject({
            message: "Ready",
            type: SmpResponseMessageTypes.SUCCESS
        });
    });

    it("should preserve subclasses when converting from plain data", () => {
        const response = SmpGenericResponseSubclass.fromPlain({
            data: "subclass"
        });

        expect(response).toBeInstanceOf(SmpGenericResponseSubclass);
        expect(response).toBeInstanceOf(SmpGenericResponse);
        expect(response.data).toBe("subclass");
    });

    it("should clone a response into an independent instance", () => {
        const response = SmpGenericResponse.fromPlain({
            data: {
                nested: {
                    value: "original"
                }
            },
            messages: ["Ready"]
        });

        const clone = response.clone();

        expect(clone).toBeInstanceOf(SmpGenericResponse);
        expect(clone).not.toBe(response);
        expect(clone.data).toEqual(response.data);
        expect(clone.data).not.toBe(response.data);
        expect(clone.data?.nested).not.toBe(response.data?.nested);
        expect(clone.messages?.[0]).toBeInstanceOf(SmpResponseMessage);
        expect(clone.messages?.[0]).not.toBe(response.messages?.[0]);
    });

    it("should create typed response messages from plain error response data", () => {
        const response = SmpErrorResponse.fromPlain({
            messages: [{
                message: "Failed",
                type: SmpResponseMessageTypes.ERROR
            }],
            errorCode: 801,
            status: 400,
            timestamp: 123
        }) as SmpErrorResponse;

        expect(response).toBeInstanceOf(SmpErrorResponse);
        expect({
            errorCode: response.errorCode,
            status: response.status,
            timestamp: response.timestamp
        }).toEqual({
            errorCode: 801,
            status: 400,
            timestamp: 123
        });
        expect(response.messages?.[0]).toBeInstanceOf(SmpResponseMessage);
        expect(response.messages?.[0]).toMatchObject({
            message: "Failed",
            type: SmpResponseMessageTypes.ERROR
        });
    });

    it("should preserve the concrete response class when cloning", () => {
        const response = new SmpErrorResponse(
            [new SmpResponseMessage("Failed", SmpResponseMessageTypes.ERROR)],
            801,
            400,
            {reason: "original"}
        );

        const clone = response.clone();

        expect(clone).toBeInstanceOf(SmpErrorResponse);
        expect(clone).not.toBe(response);
        expect(clone.serialize()).toEqual(response.serialize());
        expect(clone.data).not.toBe(response.data);
    });

    it("should serialise messages without removing underscore-prefixed data keys", () => {
        const data = {
            __CIAO__: "preserved",
            nested: {
                _private: "also preserved"
            }
        };
        const response = SmpGenericResponse.fromPlain({
            data,
            messages: [{
                message: "Ready",
                type: SmpResponseMessageTypes.SUCCESS
            }]
        });

        const serialized = response.serialize();
        const serializedData = serialized.data as typeof data;

        expect(serialized).toEqual({
            data,
            messages: [{
                message: "Ready",
                type: SmpResponseMessageTypes.SUCCESS
            }]
        });
        expect(serializedData).not.toBe(data);
        expect(serializedData.nested).not.toBe(data.nested);
        expect(serialized).not.toHaveProperty("_messages");
    });

    it("should preserve underscore-prefixed data keys when serialising an error response", () => {
        const data = {
            __CIAO__: "preserved",
            nested: {
                _private: "also preserved"
            }
        };
        const response = new SmpErrorResponse(
            [new SmpResponseMessage("Failed", SmpResponseMessageTypes.ERROR)],
            801,
            400,
            data
        );

        const serialized = response.serialize();

        expect(serialized.data).not.toBe(data);
        expect(serialized.data).toEqual(data);
        expect(serialized).toHaveProperty("messages", [{
            message: "Failed",
            type: SmpResponseMessageTypes.ERROR
        }]);
        expect(serialized).toHaveProperty("errorCode", 801);
        expect(serialized).not.toHaveProperty("_errorCode");
        expect(serialized).not.toHaveProperty("_status");
        expect(serialized).not.toHaveProperty("_timestamp");
    });
});
