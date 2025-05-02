export const VERSION = "__BUILD_VRS__" as const; // REPLACED W/ BUILD
//
export * from "./shared/api/index.js";
export * from "./shared/common/index.js";
export * from "./shared/crypto/index.js";
export * from "./shared/giftcard/index.js";
export * from "./shared/marketing-cloud/index.js";
export * from "./shared/firebase/index.js";
export * from "./shared/utils/index.js";
export * from "./services/http/index.js";
export {SmpFirebaseServiceConfig} from "./services/firebase/smp-firebase-service-config.interface.js";
// Dynamic exports
export declare const smpRxjsThrowIfEmpty: typeof import("./shared/rxjs/index.js").smpRxjsThrowIfEmpty;
export declare const smpRxjsThrowOnCondition: typeof import("./shared/rxjs/index.js").smpRxjsThrowOnCondition;
export declare const SmpDynamoService: typeof import("./services/smp-dynamo.service.js").SmpDynamoService;
export declare const SmpFirebaseService: typeof import("./services/firebase/smp-firebase.service.js").SmpFirebaseService;
/* eslint-disable accessor-pairs, @typescript-eslint/no-require-imports */
Object.defineProperties(module.exports, {
    smpRxjsThrowIfEmpty: {
        get: () => require("./shared/rxjs/index.js").smpRxjsThrowIfEmpty
    },
    smpRxjsThrowOnCondition: {
        get: () => require("./shared/rxjs/index.js").smpRxjsThrowOnCondition
    },
    SmpDynamoService: {
        get: () => require("./services/smp-dynamo.service.js").SmpDynamoService
    },
    SmpFirebaseService: {
        get: () => require("./services/firebase/smp-firebase.service.js").SmpFirebaseService
    }
});

