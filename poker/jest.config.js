module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: [ "node_modules" ],
  moduleFileExtensions: [ "js", "ts" ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)$": "<rootDir>/test/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/src/**",
    "!<rootDir>/src/**/*.d.ts",
    "!<rootDir>/node_modules/**",
  ],
  coveragePathIgnorePatterns: [
      "index.ts",
      "types.ts",
  ],
  setupFiles: [
      "<rootDir>/test/setEnvVars.ts",
  ],
};
