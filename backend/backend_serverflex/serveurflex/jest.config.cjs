module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    "Controllers/**/*.js",
    "models/**/*.js",
    "routes/**/*.js",
    "utils/**/*.js",
    "!**/node_modules/**",
    "!**/__tests__/**"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "json", "clover"]
};
