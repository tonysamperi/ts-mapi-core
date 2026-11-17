/** @jest-environment setup-polly-jest/jest-environment-node */
import {resolve} from "path";
import {setupPolly} from "setup-polly-jest";
//
import {SmpHttpTwoService, SmpRestVerbs, SmpErrorResponse} from "../../src";

const localData = {
    urls: {
        empty: "/empty",
        error: "/error",
        foo: "/foo"
    },
    sampleError: {
        messages: [
            {
                message: "ECOMMERCE_CUSTOMER_ALREADY_EXISTING",
                type: "ERROR"
            }
        ],
        errorCode: "ECOMMERCE_CUSTOMER_ALREADY_EXISTING",
        timestamp: 1736587608999
    }
};

describe("SmpHttpTwoService", () => {
    const pollyContext = setupPolly({
        adapters: [
            require("@pollyjs/adapter-fetch")
        ],
        persister: require("@pollyjs/persister-fs"),
        persisterOptions: {
            fs: {
                recordingsDir: resolve(__dirname, "../__recordings__")
            }
        },
        mode: "record"
    });

    let generateAjaxBaseSpy: jest.SpyInstance;

    beforeEach(() => {
        pollyContext.polly.server.post(localData.urls.foo).intercept(async (req, res) => {
            res.status(200).send({
                foo: "bar",
                query: req.query
            });
        });
        pollyContext.polly.server.get(localData.urls.empty).intercept(async (_req_, res) => {
            res.status(204).send("");
        });
        pollyContext.polly.server.get(localData.urls.error).intercept(async (_req_, res) => {
            res.status(400).send(localData.sampleError);
        });
        generateAjaxBaseSpy = jest.spyOn(SmpHttpTwoService, "_generateAjaxBase");
    });

    afterEach(() => {
        pollyContext.polly.flush();
        jest.clearAllMocks();
    });

    it("should handle a post request with correct types", async () => {
        const response = await SmpHttpTwoService.$http<{ foo: "bar" }>({
            method: SmpRestVerbs.POST,
            url: localData.urls.foo
        });
    });

    it("should handle an empty response", async () => {
        const response = await SmpHttpTwoService.$http({
            url: localData.urls.empty
        });

        expect(response).toBe(null);
    });

    it("should parse SmpErrorResponse", async () => {
        const response: SmpErrorResponse = await SmpHttpTwoService.$http({
            url: localData.urls.error
        }).catch((e: any) => {
            return e.body;
        });
        //
        expect(response).toBeInstanceOf(SmpErrorResponse);
        expect(response.errorCode).toBe(localData.sampleError.errorCode);
        expect(response.messages).toEqual(localData.sampleError.messages);
        expect(response.timestamp).toBe(localData.sampleError.timestamp);
    });

    it("should dedupe calls", async () => {
        const promises = [
            SmpHttpTwoService.$http({
                url: localData.urls.error
            }).catch((e: any) => {
                return e.body;
            }),
            SmpHttpTwoService.$http({
                url: localData.urls.error
            }).catch((e: any) => {
                return e.body;
            })
        ];
        await Promise.all(promises);
        expect(generateAjaxBaseSpy).toBeCalledTimes(1);
    });

});
