import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local'), debug: false });

export default {
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
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    coveragePathIgnorePatterns: ['/node_modules/', '/.next/', '/coverage/'],
    collectCoverageFrom: [
        'app/api/**/*.{ts,tsx}',
        'lib/server/**/*.{ts,tsx}',
        'lib/auth*.ts',
        'lib/utils.ts',
        '!context/**/*.{ts,tsx}',
        '!components/**/*.{ts,tsx}',
        '!app/**/page.tsx',
        '!**/*.d.ts',
        '!**/index.ts',
        '!**/*.config.{js,ts,mjs}',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/.next/**',
    ],
};
