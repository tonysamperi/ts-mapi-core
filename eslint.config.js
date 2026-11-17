import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";
//
import {smpEslintRecommendedConfig} from "./src/shared/eslint/smp-eslint-plugin.js";
import {smpMemberOrderingRules, smpNamingConventionRules} from "./src/shared/eslint/smp-typescript-rules.js";

export default tsEslint.config({
        ignores: [
            "node_modules/**/*",
            "dist/**/*",
            "test/**/*",
            "**/gulpfile.cjs",
            "**/build.config.js",
            "**/build-tsup.config.js",
            "**/jest.config.js",
            "eslint.config.js",
            "scripts/**/*"
        ]
    },
    {
        extends: [
            eslint.configs.recommended,
            ...tsEslint.configs.recommended,
            ...tsEslint.configs.stylistic
        ],
        rules: {
            "accessor-pairs": ["error", {
                getWithoutSet: true,
                setWithoutGet: true,
                enforceForClassMembers: false
            }],
            "eol-last": "warn",
            "grouped-accessor-pairs": ["error", "setBeforeGet"],
            "@typescript-eslint/consistent-type-definitions": "error",

            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "_.*_"
            }],
            "@typescript-eslint/dot-notation": "off",
            "@typescript-eslint/explicit-member-accessibility": ["off", {
                accessibility: "explicit"
            }],
            "@typescript-eslint/no-unused-expressions": "off",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/interface-name-prefix": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/class-literal-property-style": "off",
            "no-extra-boolean-cast": "off",
            ...smpMemberOrderingRules,
            ...smpNamingConventionRules,
            "no-misleading-character-class": "off"
        }
    },
    smpEslintRecommendedConfig
);
