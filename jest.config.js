module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleNameMapper: {
    '^@client/(.*)$': '<rootDir>/client/src/$1',
    '^@server/(.*)$': '<rootDir>/server/src/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  verbose: true,
};