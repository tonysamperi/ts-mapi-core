import {replaceInFile} from "replace-in-file";
import tsup from "tsup";
import pkg from "./package.json" with {type: "json"};

async function doBuild() {
    const {version, peerDependencies} = pkg;
    const isProd = process.env.NODE_ENV === "production";
    const external = [
        ...Object.keys(peerDependencies),
        "@firebase"
    ];

    await tsup.build({
        clean: !0,
        entry: ["src/**/*.ts"],
        format: "esm",
        outDir: "dist/esm",
        bundle: !0,
        dts: {
            outDir: "dist/esm",
            resolve: !0
        },
        minify: isProd,
        sourcemap: !1,
        target: "esnext",
        external
    });

    await tsup.build({
        clean: !0,
        entry: ["src/**/*.ts", "!src/index.ts", "src/index.cts"],
        format: "cjs",
        outDir: "dist/cjs",
        target: "esnext",
        dts: {
            outDir: "dist/cjs",
            resolve: !0
        },
        minify: isProd,
        sourcemap: !0,
        external
    });

    await replaceInFile({
        files: "dist/**/*",
        from: [/__BUILD_VRS__/g],
        to: [version]
    });

    console.log("✅ Build completed w/ tsup!");
}

try {
    doBuild();
}
catch (e) {
    console.error("❌ Build errored", e);
}
