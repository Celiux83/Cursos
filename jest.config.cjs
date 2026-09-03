/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest', // used for TypeScript support in Jest. compile TypeScript files on the fly
  testEnvironment: 'node', // to tell jest that won't run in a browser environment
  roots: ['<rootDir>/test'], // Tells Jest to only look for test files inside the tests/ directory at the project root.
  testMatch: ['**/*.test.ts', '**/*.spec.ts'], // file naming patterns Jest uses to identify test files
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'], // which files are included in code coverage reports
  coverageDirectory: 'coverage', // output folder for coverage reports
  clearMocks: true, // resets all mocks between every test
  coverageTreholds: {
    global: {
      branches: 80, 
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },  
};
