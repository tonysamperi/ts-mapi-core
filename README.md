# Develop locally

## Install deps

We use Yarn **Berry**, so
* `corepack enable` (if you haven't already)
* `npm i -g yarn` (if you haven't already)
* `yarn install`

## Try locally
* `npm run build`

## Release a beta version ⚠️
To release a beta version, just push a beta tag, e.g. `3.0.0-beta.0`

## Release a production version ⚠️
To release a production version you just need to push a tag 

## ESLint flat config

The `./eslint` export provides a flat config for requiring `.js` extensions on relative imports and exports in TypeScript files. Add it to the ESLint config after the TypeScript parser configuration:

```js
import {smpEslintRecommendedConfig} from "@tonysamperi/ts-mapi-core/eslint";

export default [
    // Existing configs
    smpEslintRecommendedConfig
];
```

Run ESLint with `--fix` to apply the `.js` extension automatically.

The TypeScript rule maps are also exported for reuse. Register `@typescript-eslint` in the flat config, then spread the maps into `rules`:

```js
import {smpMemberOrderingRules, smpNamingConventionRules} from "@tonysamperi/ts-mapi-core/eslint";

export default [
    {
        rules: {
            ...smpMemberOrderingRules,
            ...smpNamingConventionRules
        }
    }
];
```

`smpEslintRecommendedConfig` also registers and enables the safe class-member ordering autofix for TypeScript files. Run ESLint with `--fix` to apply it.

<!--
`(?:import|export)\s+(?:[^'"]+?\s+from\s+|\*\s+from\s+)?["'](\.\/[^'"]*?)(?<!\.js)["']`
-->
