export default {
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: "test/tsconfig.json"
            }
        ]
    },
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    testEnvironment: "node",
    testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js"
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/test/",
        "/dist/"
    ],
    coverageThreshold: {
        "global": {
            "branches": 90,
            "functions": 95,
            "lines": 95,
            "statements": 95
        }
    },
    collectCoverageFrom: [
        "src/**/*.ts"
    ]
};
