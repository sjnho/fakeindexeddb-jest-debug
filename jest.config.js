/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  rootDir: './',
  testEnvironment: 'jsdom',
  maxWorkers: '50%',
  setupFiles: ['fake-indexeddb/auto'],
  testEnvironment: './fixJsdomEnv.ts',
  preset: 'ts-jest/presets/js-with-ts-esm',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['/typing.ts/'],
  moduleNameMapper: {},
};
