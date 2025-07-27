// jest.config.mjs
export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jsdom',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // make sure this is .ts and uses CJS-style imports if needed
    transformIgnorePatterns: ['node_modules/(?!(node-fetch)/)'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: './tsconfig.json', // optional but recommended
            },
        ],
    },
};
