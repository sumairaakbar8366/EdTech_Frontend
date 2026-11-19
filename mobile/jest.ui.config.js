// Screen tests: the real screens with the phone's native pieces replaced by fakes.
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__ui__/**/*.test.tsx'],
  testTimeout: 30000,
  setupFiles: ['<rootDir>/__ui__/setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
};
