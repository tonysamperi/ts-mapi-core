export const VERSION = "__BUILD_VRS__" as const; // REPLACED W/ BUILD
//
export * from "./services/http/index.js";
export {SmpFirebaseServiceConfig} from "./services/firebase/smp-firebase-service-config.interface.js";
//
export * from "./shared/api/index.js";
export * from "./shared/common/index.js";
export * from "./shared/crypto/index.js";
export * from "./shared/firebase/index.js";
export * from "./shared/giftcard/index.js";
export * from "./shared/marketing-cloud/index.js";
export * from "./shared/utils/index.js";
// Dynamic exports
export declare const SmpDynamoService: typeof import("./services/smp-dynamo.service.js").SmpDynamoService;
export declare const SmpFirebaseService: typeof import("./services/firebase/smp-firebase.service.js").SmpFirebaseService;
export declare const SmpAbstractRxjsTtlCacheStrategy: typeof import("./shared/rxjs/index.js").SmpAbstractRxjsTtlCacheStrategy;
export declare const SmpRxjsInMemoryCache: typeof import("./shared/rxjs/index.js").SmpRxjsInMemoryCache;
export declare const smpRxjsCatchOnly: typeof import("./shared/rxjs/index.js").smpRxjsCatchOnly;
export declare const smpRxjsQueue: typeof import("./shared/rxjs/index.js").smpRxjsQueue;
export declare const smpRxjsSequence: typeof import("./shared/rxjs/index.js").smpRxjsSequence;
export declare const smpRxjsThrowIfEmpty: typeof import("./shared/rxjs/index.js").smpRxjsThrowIfEmpty;
export declare const smpRxjsThrowOnCondition: typeof import("./shared/rxjs/index.js").smpRxjsThrowOnCondition;
export declare const smpZodDateTime: typeof import("./shared/zod/index.js").smpZodDateTime;
export declare const SmpZodDateTime: typeof import("./shared/zod/index.js").SmpZodDateTime;
/* eslint-disable accessor-pairs, @typescript-eslint/no-require-imports */
Object.defineProperties(module.exports, {
    SmpDynamoService: {
        get: () => require("./services/smp-dynamo.service.js").SmpDynamoService
    },
    SmpFirebaseService: {
        get: () => require("./services/firebase/smp-firebase.service.js").SmpFirebaseService
    },
    SmpAbstractRxjsTtlCacheStrategy: {
        get: () => require("./shared/rxjs/index.js").SmpAbstractRxjsTtlCacheStrategy
    },
    smpRxjsCatchOnly: {
        get: () => require("./shared/rxjs/index.js").smpRxjsCatchOnly
    },
    SmpRxjsInMemoryCache: {
        get: () => require("./shared/rxjs/index.js").SmpRxjsInMemoryCache
    },
    smpRxjsQueue: {
        get: () => require("./shared/rxjs/index.js").smpRxjsQueue
    },
    smpRxjsSequence: {
        get: () => require("./shared/rxjs/index.js").smpRxjsSequence
    },
    smpRxjsThrowIfEmpty: {
        get: () => require("./shared/rxjs/index.js").smpRxjsThrowIfEmpty
    },
    smpRxjsThrowOnCondition: {
        get: () => require("./shared/rxjs/index.js").smpRxjsThrowOnCondition
    },
    smpZodDateTime: {
        get: () => require("./shared/zod/index.js").smpZodDateTime
    },
    SmpZodDateTime: {
        get: () => require("./shared/zod/index.js").SmpZodDateTime
    }
});

