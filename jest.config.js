module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["js", "ts"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        moduleResolution: 'node10',
        module: 'commonjs'
      }
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!@actions/http-client)'
  ],
  moduleNameMapper: {
    '^@actions/http-client/lib/auth$': '<rootDir>/__mocks__/@actions/http-client/auth.ts'
  },
  verbose: true,
};
