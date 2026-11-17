import {RuleTester} from "eslint";
import smpMemberOrderingAutofixRule from "../../../src/shared/eslint/smp-member-ordering-autofix-rule.function.js";
import {smpMemberOrderingRules} from "../../../src/shared/eslint/smp-typescript-rules.js";

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    }
});

ruleTester.run(
    "smp/member-ordering-autofix",
    smpMemberOrderingAutofixRule(smpMemberOrderingRules["@typescript-eslint/member-ordering"][1]),
    {
        valid: [
            "class Example { alpha() {} beta() {} }"
        ],
        invalid: [
            {
                code: "class Example { beta() {} alpha() {} }",
                output: "class Example { alpha() {} beta() {} }",
                errors: [{messageId: "sort"}]
            },
            {
                code: [
                    "class Example {",
                    "    beta() {}",
                    "    /** Alpha documentation. */",
                    "    alpha() {}",
                    "}"
                ].join("\n"),
                output: [
                    "class Example {",
                    "    /** Alpha documentation. */",
                    "    alpha() {}",
                    "    beta() {}",
                    "}"
                ].join("\n"),
                errors: [{messageId: "sort"}]
            }
        ]
    }
);
