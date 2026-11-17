import smpMemberOrderingAutofixRule from "./smp-member-ordering-autofix-rule.function.js";
import {smpMemberOrderingRules} from "./smp-typescript-rules.js";

/**
 * @typedef {{range: [number, number], text: string}} SmpEslintRuleFix
 * @typedef {{insertTextBeforeRange(range: [number, number], text: string): SmpEslintRuleFix}} SmpEslintFixer
 * @typedef {{value: unknown, range: [number, number]}} SmpEslintSourceNode
 * @typedef {{source: SmpEslintSourceNode}} SmpEslintAstNode
 * @typedef {{filename?: string, getFilename(): string, report(descriptor: {node: SmpEslintSourceNode, messageId: "missingJsExtension", data: {source: string}, fix(fixer: SmpEslintFixer): SmpEslintRuleFix}): void}} SmpEslintRuleContext
 */

const smpRequireJsExtensionRule = {
    meta: {
        /** @type {"problem"} */
        type: "problem",
        /** @type {"code"} */
        fixable: "code",
        docs: {
            description: "Require .js extension for relative imports/exports in TypeScript files"
        },
        schema: [],
        messages: {
            missingJsExtension: "Relative path '{{source}}' must include '.js' extension."
        }
    },
    /** @param {SmpEslintRuleContext} context */
    create(context) {
        const filename = context.filename || context.getFilename();
        const isTypeScriptFile = /\.(ts|tsx|mts|cts)$/.test(filename);

        if (!isTypeScriptFile) {
            return {};
        }

        /** @param {SmpEslintAstNode} node */
        const checkNode = (node) => {
            const source = node.source?.value;
            if (typeof source !== "string") {
                return;
            }
            if (!source.startsWith("./") && !source.startsWith("../")) {
                return;
            }
            if (source.endsWith(".js") || source.endsWith(".mjs") || source.endsWith(".cjs") || source.endsWith(".json")) {
                return;
            }

            context.report({
                node: node.source,
                messageId: "missingJsExtension",
                data: {
                    source
                },
                fix(fixer) {
                    const closingQuote = node.source.range[1] - 1;

                    return fixer.insertTextBeforeRange([closingQuote, closingQuote], ".js");
                }
            });
        };

        return {
            ImportDeclaration: checkNode,
            ExportAllDeclaration: checkNode,
            /** @param {{source?: SmpEslintSourceNode}} node */
            ExportNamedDeclaration(node) {
                node.source && checkNode(node);
            }
        };
    }
};

const smpMemberOrderingAutofixRuleWithConfiguration = smpMemberOrderingAutofixRule(
    smpMemberOrderingRules["@typescript-eslint/member-ordering"][1]
);

export const smpEslintPlugin = {
    meta: {
        name: "@tonysamperi/ts-mapi-core"
    },
    rules: {
        "member-ordering-autofix": smpMemberOrderingAutofixRuleWithConfiguration,
        "require-js-extension": smpRequireJsExtensionRule
    }
};

export const smpEslintRecommendedConfig = {
    files: [
        "**/*.ts",
        "**/*.tsx",
        "**/*.mts",
        "**/*.cts"
    ],
    plugins: {
        smp: smpEslintPlugin
    },
    rules: {
        /** @type {"error"} */
        "smp/member-ordering-autofix": "error",
        /** @type {"error"} */
        "smp/require-js-extension": "error"
    }
};
