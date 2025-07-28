// jest.config.mjs
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local (silently)
config({ path: path.resolve(process.cwd(), '.env.local'), debug: false });

export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
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
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    coveragePathIgnorePatterns: ['/node_modules/', '/.next/', '/coverage/'],
    collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}', 
        'context/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'types/**/*.{ts,tsx}',
        '!app/layout.tsx',
        '!app/globals.css',
        '!**/*.d.ts',
        '!**/index.ts',
        '!lib/Firebase.tsx',
        '!next.config.ts',
        '!tailwind.config.js',
        '!jest.*.{js,mjs,ts}',
    ],
};
