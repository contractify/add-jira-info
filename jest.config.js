module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["js", "mjs", "ts"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        moduleResolution: 'node10',
        module: 'commonjs',
        types: ['jest']
      }
    }],
    '^.+\\.m?js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@actions/http-client|nock|@mswjs/interceptors|@open-draft/until|rettime)/)'
  ],
  moduleNameMapper: {
    '^@actions/http-client/lib/auth$': '<rootDir>/__mocks__/@actions/http-client/auth.ts'
  },
  verbose: true,
};
