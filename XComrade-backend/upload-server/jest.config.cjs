/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',  testPathIgnorePatterns: ['/node_modules/', '/dist/'],  transform: {
    '^.+\\.tsx?$': ['ts-jest', { diagnostics: false, isolatedModules: true }],
  },
  moduleNameMapper: {
    '^@xcomrade/types-server(.*)$': '<rootDir>/../../XComrade-hybrid-types/dist/Index.js',
  },
};
