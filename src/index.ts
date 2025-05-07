export const VERSION = "__BUILD_VRS__" as const; // REPLACED W/ BUILD

export * from "./services/http/index.js";
export * from "./shared/api/index.js";
export * from "./shared/common/index.js";
export * from "./shared/crypto/index.js";
export * from "./shared/giftcard/index.js";
export * from "./shared/marketing-cloud/index.js";
export * from "./shared/firebase/index.js";
export * from "./shared/rxjs/index.js";
export * from "./shared/utils/index.js";
//
export * from "./services/firebase/index.js";
export {SmpDynamoService} from "./services/smp-dynamo.service.js";
