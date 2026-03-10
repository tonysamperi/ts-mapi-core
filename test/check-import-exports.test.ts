import fs from "fs";
import {sync} from "glob";
import {resolve} from "path";

const PATTERN = /^(?:\s*)(?:import|export)\s+(?:[^'"]+?\s+from\s+|\*\s+from\s+)?["'](\.{1,2}\/[^'"]*?)(?<!\.js)["']/gm;

describe("Import/Export path endings", () => {
    it("should only use .js extension in relative import/export paths", () => {
        const files = sync("src/**/*.ts", {cwd: resolve(__dirname, "..")});

        const violations: { file: string; line: number; content: string }[] = [];

        for (const relativeFile of files) {
            const absoluteFile = resolve(__dirname, "..", relativeFile);
            const content = fs.readFileSync(absoluteFile, "utf8");
            const lines = content.split("\n");

            lines.forEach((line, index) => {
                const matches = line.match(PATTERN);
                if (matches) {
                    violations.push({ file: relativeFile, line: index + 1, content: line.trim() });
                }
            });
        }

        if (violations.length > 0) {
            const message = violations
                .map(v => `${v.file}:${v.line} → ${v.content}`)
                .join("\n");
            throw new Error(
                `Found ${violations.length} import/export path(s) not ending with ".js":\n${message}`
            );
        }
    });
});
