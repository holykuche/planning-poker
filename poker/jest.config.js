module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: [ "src", "node_modules" ],
  moduleFileExtensions: [ "js", "ts" ],
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
