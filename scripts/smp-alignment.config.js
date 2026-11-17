import path from "node:path";

const smpRepoRoot = path.resolve(import.meta.dirname, "..");

export const smpAlignmentConfig = {
    // Paths use the target naming and apply in both directions (also to source-only files).
    // An entry ending with "/" excludes the whole directory.
    excludedTargetFiles: [
        // Kik logger wrapper: not reexported here (see AGENTS.md)
        "services/logger/",
        // Error codes and messages
        "shared/api/smp-api-generic-error.class.ts",
        "shared/api/smp-error-codes.model.ts",
        // Giftcard
        "shared/giftcard/smp-giftcard-currencies.enum.ts",
        "shared/giftcard/smp-giftcard-legacy-transaction.class.ts",
        "shared/giftcard/smp-giftcard-legacy-transaction-op.enum.ts",
        "shared/giftcard/smp-giftcard-providers.enum.ts",
        "shared/giftcard/smp-giftcard-secure-code.class.ts",
        "shared/zod/smp-giftcard-zod-schemas.class.ts",
        // Marketing cloud
        "shared/marketing-cloud/smp-marketing-cloud-double-opt-in-procedures.enum.ts",
        "shared/marketing-cloud/smp-marketing-cloud-email-keys.enum.ts",
        "shared/marketing-cloud/smp-marketing-cloud-send-email-response.interface.ts",
        "shared/zod/smp-marketing-cloud-send-action-code-email-params.type.ts",
        "shared/zod/smp-marketing-cloud-send-email-params.type.ts",
        "shared/zod/smp-marketing-cloud-send-link-email-params.type.ts",
        "shared/zod/smp-marketing-cloud-zod-schemas.class.ts",
        // User related schemas
        "shared/zod/smp-customer-fields.model.ts",
        "shared/zod/smp-customer-password.model.ts",
        "shared/zod/smp-customer-sign-up.model.ts",
        "shared/zod/smp-customer-update.model.ts",
        "shared/zod/smp-generic-action-code.model.ts",
        "shared/zod/smp-in-store-customer-sign-up.model.ts",
        "shared/zod/smp-prospect-fields.model.ts",
        "shared/zod/smp-signed-email-action-params.model.ts",
        "shared/zod/smp-user-zod-schemas.class.ts"
    ],
    extensions: [
        ".cjs",
        ".cts",
        ".js",
        ".json",
        ".jsx",
        ".mjs",
        ".mts",
        ".ts",
        ".tsx"
    ],
    targetRoot: path.join(smpRepoRoot, "src")
};
