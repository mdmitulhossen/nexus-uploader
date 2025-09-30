/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(file-type|strtok3)/)',
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^file-type$': '<rootDir>/src/__mocks__/file-type.js',
    '^clamav.js$': '<rootDir>/src/__mocks__/clamav.js',
    '^memory-cache$': '<rootDir>/src/__mocks__/memory-cache.js',
  },
};
