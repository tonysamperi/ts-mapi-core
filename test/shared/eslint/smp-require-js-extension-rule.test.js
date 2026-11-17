import {RuleTester} from "eslint";
import {smpEslintPlugin} from "../../../src/shared/eslint/smp-eslint-plugin.js";

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    }
});

ruleTester.run(
    "smp/require-js-extension",
    smpEslintPlugin.rules["require-js-extension"],
    {
        valid: [
            {code: "import a from \"./a.js\";", filename: "file.ts"},
            {code: "import a from \"./a.json\";", filename: "file.ts"},
            {code: "export * from \"../b.mjs\";", filename: "file.ts"},
            {code: "import a from \"some-package\";", filename: "file.ts"},
            {code: "export {a} from \"@scope/package/sub\";", filename: "file.ts"},
            {code: "import a from \"./a\";", filename: "file.js"}
        ],
        invalid: [
            {
                code: "import a from \"./a\";",
                filename: "file.ts",
                output: "import a from \"./a.js\";",
                errors: [{messageId: "missingJsExtension"}]
            },
            {
                code: "export * from \"../b\";",
                filename: "file.ts",
                output: "export * from \"../b.js\";",
                errors: [{messageId: "missingJsExtension"}]
            },
            {
                code: "export {c} from \"./c\";",
                filename: "file.ts",
                output: "export {c} from \"./c.js\";",
                errors: [{messageId: "missingJsExtension"}]
            }
        ]
    }
);
