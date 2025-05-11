export const VERSION = "__BUILD_VRS__" as const; // REPLACED W/ BUILD
//
// Since it's an interface, it cannot be exported like below. Since SWC it can't be name exported either
export * from "./services/firebase/smp-firebase-service-config.interface.js";
export * from "./services/http/index.js";
//
export * from "./shared/api/index.js";
export * from "./shared/common/index.js";
export * from "./shared/crypto/index.js";
export * from "./shared/giftcard/index.js";
export * from "./shared/marketing-cloud/index.js";
export * from "./shared/firebase/index.js";
export * from "./shared/utils/index.js";
// Dynamic exports
export declare const SmpDynamoService: typeof import("./services/smp-dynamo.service.js").SmpDynamoService;
export declare const SmpFirebaseService: typeof import("./services/firebase/smp-firebase.service.js").SmpFirebaseService;
export declare const smpRxjsCatchOnly: typeof import("./shared/rxjs/index.js").smpRxjsCatchOnly;
export declare const smpRxjsThrowIfEmpty: typeof import("./shared/rxjs/index.js").smpRxjsThrowIfEmpty;
export declare const smpRxjsThrowOnCondition: typeof import("./shared/rxjs/index.js").smpRxjsThrowOnCondition;
export declare const smpZodDateTime: typeof import("./shared/zod/index.js").smpZodDateTime;
/* eslint-disable accessor-pairs, @typescript-eslint/no-require-imports */
Object.defineProperties(module.exports, {
    SmpDynamoService: {
        get: () => require("./services/smp-dynamo.service.js").SmpDynamoService
    },
    SmpFirebaseService: {
        get: () => require("./services/firebase/smp-firebase.service.js").SmpFirebaseService
    },
    smpRxjsCatchOnly: {
        get: () => require("./shared/rxjs/index.js").smpRxjsCatchOnly
    },
    smpRxjsThrowIfEmpty: {
        get: () => require("./shared/rxjs/index.js").smpRxjsThrowIfEmpty
    },
    smpRxjsThrowOnCondition: {
        get: () => require("./shared/rxjs/index.js").smpRxjsThrowOnCondition
    },
    smpZodDateTime: {
        get: () => require("./shared/zod/index.js").smpZodDateTime
    }
});

