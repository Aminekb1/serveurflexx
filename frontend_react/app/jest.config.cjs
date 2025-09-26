module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/test-setup.js'],            // <-- IMPORTANT
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,   
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/coverage/**"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "json", "clover", "cobertura"],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js'
  }

};