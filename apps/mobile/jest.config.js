/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@laughtrack/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
    '^@laughtrack/logger/react-native$': '<rootDir>/../../packages/logger/src/react-native/index.ts',
    '^@laughtrack/logger/node$': '<rootDir>/../../packages/logger/src/node/index.ts',
    '^@laughtrack/logger$': '<rootDir>/../../packages/logger/src/index.ts',
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/mocks/**',
    '!**/node_modules/**',
  ],
};
