import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local'), debug: false });

const jestConfig = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
    transformIgnorePatterns: [
        'node_modules/(?!(node-fetch|fetch-blob|data-uri-to-buffer|formdata-polyfill)/)',
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testMatch: [
        '<rootDir>/tests/**/*.test.{ts,tsx}',
        '<rootDir>/**/__tests__/**/*.{ts,tsx}',
    ],
    globalSetup: '<rootDir>/tests/jest.globalSetup.ts',
    globalTeardown: '<rootDir>/tests/jest.globalTeardown.ts',
    testTimeout: 30000,
    collectCoverage: false,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'context/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/.next/**',
    ],
};

export default jestConfig;
