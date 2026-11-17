import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {createTwoFilesPatch} from "diff";

import {smpAlignmentConfig} from "./smp-alignment.config.js";

const smpDefaultExtensions = new Set([
    ".cjs",
    ".cts",
    ".js",
    ".json",
    ".jsx",
    ".mjs",
    ".mts",
    ".ts",
    ".tsx"
]);

const smpSpecialPathMappings = new Map([
    ["smp-sid", "kik-gcpsid"]
]);

const smpSpecialContentMappings = new Map([
    ["@tonysamperi/ts-mapi-core", "@kikocosmeticsorg/uc-api-nest-common-fe"],
    ["SmpSid", "KikGcpsid"],
    ["smpSid", "kikGcpsid"],
    ["smp-sid", "kik-gcpsid"]
]);

function smpParseArgs(argv) {
    return argv.reduce((acc, arg) => {
        const [rawKey, ...rawValue] = arg.replace(/^--/, "").split("=");
        const value = rawValue.join("=");

        if (!rawKey) {
            return acc;
        }

        acc[rawKey] = value || !0;

        return acc;
    }, {});
}

function smpToPosixPath(filePath) {
    return filePath.split(path.sep).join("/");
}

function smpHasAllowedExtension(filePath, extensions) {
    return extensions.has(path.extname(filePath));
}

function smpWalkFiles(dirPath, extensions) {
    return fs.readdirSync(dirPath, {
        withFileTypes: !0
    }).reduce((acc, entry) => {
        const nextPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            acc.push(...smpWalkFiles(nextPath, extensions));

            return acc;
        }

        if (entry.isFile() && smpHasAllowedExtension(entry.name, extensions)) {
            acc.push(nextPath);
        }

        return acc;
    }, []);
}

function smpReplaceTokens(value, replacements) {
    return replacements.reduce((acc, [from, to]) => acc.split(from).join(to), value);
}

function smpMapTargetPathToSource(targetRelativePath) {
    const withSpecialMappings = [...smpSpecialPathMappings.entries()].reduce((acc, [from, to]) => acc.split(from).join(to), targetRelativePath);

    return withSpecialMappings
        .split("Smp").join("Kik")
        .split("smp").join("kik")
        .split("SMP").join("KIK");
}

// An entry ending with "/" excludes the whole directory, otherwise it must match the file path exactly
function smpIsExcluded(relativePath, excludedPaths) {
    return excludedPaths.some((excludedPath) => relativePath === excludedPath || (excludedPath.endsWith("/") && relativePath.startsWith(excludedPath)));
}

function smpNormaliseFileContent(fileContent) {
    return smpReplaceTokens(fileContent.replace(/\r\n/g, "\n"), [...smpSpecialContentMappings.entries()])
        .split("Smp").join("Kik")
        .split("smp").join("kik")
        .split("SMP").join("KIK");
}

function smpListRelativeFiles(rootPath, extensions) {
    return smpWalkFiles(rootPath, extensions)
        .map((filePath) => path.relative(rootPath, filePath))
        .map(smpToPosixPath)
        .sort((left, right) => left.localeCompare(right));
}

function smpFindMissingInTarget(config, allTargetFiles) {
    const mappedTargetFiles = new Set(allTargetFiles.map(smpMapTargetPathToSource));
    // Exclusions are written with target names, so they get mapped like any other target path
    const excludedSourceFiles = config.excludedTargetFiles.map(smpMapTargetPathToSource);

    return smpListRelativeFiles(config.sourceRoot, config.extensions)
        .filter((sourceRelativePath) => !mappedTargetFiles.has(sourceRelativePath))
        .filter((sourceRelativePath) => !smpIsExcluded(sourceRelativePath, excludedSourceFiles));
}

function smpBuildResult(config) {
    const allTargetFiles = smpListRelativeFiles(config.targetRoot, config.extensions);
    const targetFiles = allTargetFiles.filter((relativePath) => !smpIsExcluded(relativePath, config.excludedTargetFiles));

    return targetFiles.reduce((acc, targetRelativePath) => {
        const sourceRelativePath = smpMapTargetPathToSource(targetRelativePath);
        const targetAbsolutePath = path.join(config.targetRoot, targetRelativePath);
        const sourceAbsolutePath = path.join(config.sourceRoot, sourceRelativePath);

        if (!fs.existsSync(sourceAbsolutePath)) {
            acc.missingInSource.push({
                sourceRelativePath,
                targetRelativePath
            });

            return acc;
        }

        const targetOriginalContent = fs.readFileSync(targetAbsolutePath, "utf8");
        const sourceOriginalContent = fs.readFileSync(sourceAbsolutePath, "utf8");
        const targetNormalisedContent = smpNormaliseFileContent(targetOriginalContent);
        const sourceNormalisedContent = smpNormaliseFileContent(sourceOriginalContent);

        if (targetNormalisedContent !== sourceNormalisedContent) {
            acc.different.push({
                diff: createTwoFilesPatch(
                    sourceRelativePath,
                    targetRelativePath,
                    sourceNormalisedContent,
                    targetNormalisedContent,
                    "source (normalised)",
                    "target (normalised)"
                ),
                sourceRelativePath,
                targetRelativePath
            });

            return acc;
        }

        acc.identical += 1;

        return acc;
    }, {
        different: [],
        identical: 0,
        missingInSource: [],
        missingInTarget: smpFindMissingInTarget(config, allTargetFiles),
        scanned: targetFiles.length
    });
}

function smpPrintTextReport(result, config) {
    console.log("Alignment check");
    console.log(`source: ${config.sourceRoot}`);
    console.log(`target: ${config.targetRoot}`);
    console.log("");
    console.log(`scanned: ${result.scanned}`);
    console.log(`identical: ${result.identical}`);
    console.log(`different: ${result.different.length}`);
    console.log(`missing in source: ${result.missingInSource.length}`);
    console.log(`missing in target: ${result.missingInTarget.length}`);

    if (result.different.length) {
        console.log("");
        console.log("Different files:");
        result.different.forEach(({targetRelativePath, sourceRelativePath}) => {
            console.log(`- ${targetRelativePath} <=/=> ${sourceRelativePath}`);
        });
    }

    if (result.missingInSource.length) {
        console.log("");
        console.log("Missing in source:");
        result.missingInSource.forEach(({targetRelativePath, sourceRelativePath}) => {
            console.log(`- ${targetRelativePath} -> ${sourceRelativePath}`);
        });
    }

    if (result.missingInTarget.length) {
        console.log("");
        console.log("Missing in target (source only):");
        result.missingInTarget.forEach((sourceRelativePath) => {
            console.log(`- ${sourceRelativePath}`);
        });
    }
}

function smpPrintDiffReport(result) {
    if (!result.different.length) {
        return;
    }

    console.log("");
    console.log("Unified diff:");
    result.different.forEach(({diff}) => {
        console.log(diff);
    });
}

function smpResolveConfig(cliArgs) {
    const sourceRoot = cliArgs.source || process.env.SMP_ALIGNMENT_SOURCE;
    const targetRoot = cliArgs.target || process.env.SMP_ALIGNMENT_TARGET || smpAlignmentConfig.targetRoot;

    if (!sourceRoot) {
        throw new Error("Missing source root. Pass --source=/path/to/source/src or set SMP_ALIGNMENT_SOURCE.");
    }

    return {
        excludedTargetFiles: smpAlignmentConfig.excludedTargetFiles.map(smpToPosixPath),
        extensions: new Set(smpAlignmentConfig.extensions || [...smpDefaultExtensions]),
        sourceRoot: path.resolve(sourceRoot),
        targetRoot: path.resolve(targetRoot)
    };
}

const smpCliArgs = smpParseArgs(process.argv.slice(2));
const smpResolvedConfig = smpResolveConfig(smpCliArgs);
const smpResult = smpBuildResult(smpResolvedConfig);

if (smpCliArgs.json) {
    console.log(JSON.stringify({
        different: smpResult.different.map(({sourceRelativePath, targetRelativePath, diff}) => ({
            diff,
            sourceRelativePath,
            targetRelativePath
        })),
        identical: smpResult.identical,
        missingInSource: smpResult.missingInSource,
        missingInTarget: smpResult.missingInTarget,
        scanned: smpResult.scanned,
        sourceRoot: smpResolvedConfig.sourceRoot,
        targetRoot: smpResolvedConfig.targetRoot
    }, null, 2));
}
else {
    smpPrintTextReport(smpResult, smpResolvedConfig);

    if (smpCliArgs.diff) {
        smpPrintDiffReport(smpResult);
    }
}

process.exit(smpResult.different.length || smpResult.missingInSource.length || smpResult.missingInTarget.length ? 1 : 0);
