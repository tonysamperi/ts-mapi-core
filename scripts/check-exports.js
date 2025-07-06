import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const cjsModulePath = path.resolve(__dirname, '../dist/cjs/index.cjs');
const esmModulePath = path.resolve(__dirname, '../dist/esm/index.js');

console.log('Checking for export consistency between CJS and ESM modules...');

try {
    const cjsModule = require(cjsModulePath);
    const esmModule = await import(pathToFileURL(esmModulePath).href);
    const cjsKeys = new Set(Object.getOwnPropertyNames(cjsModule));
    const esmKeys = new Set(Object.keys(esmModule));
    const keysToIgnore = ['default', '__esModule'];
    for (const key of keysToIgnore) {
        cjsKeys.delete(key);
        esmKeys.delete(key);
    }
    const missingInCjs = [...esmKeys].filter(key => !cjsKeys.has(key));
    const missingInEsm = [...cjsKeys].filter(key => !esmKeys.has(key));

    if (missingInCjs.length > 0 || missingInEsm.length > 0) {
        console.error('❌ Error: CJS and ESM exports do not match!');

        if (missingInCjs.length > 0) {
            console.error(`\nExports found in ESM but MISSING in CJS:\n - ${missingInCjs.join('\n - ')}`);
        }

        if (missingInEsm.length > 0) {
            console.error(`\nExports found in CJS but MISSING in ESM:\n - ${missingInEsm.join('\n - ')}`);
        }

        process.exit(1);
    }

    console.log('✅ Success: All exports are consistent across CJS and ESM modules.');
    process.exit(0);

} catch (error) {
    console.error('❌ An error occurred while checking exports:', error);
    process.exit(1);
}
