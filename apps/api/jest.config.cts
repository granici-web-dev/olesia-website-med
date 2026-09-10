/* eslint-disable */
const { readFileSync } = require('fs');

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8'),
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

module.exports = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    // `.cjs`/`.mjs` too: otplib's published entry points use both.
    '^.+\\.[cm]?[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  // otplib ships ESM only, as do the crypto packages it pulls in, so the TOTP
  // tests need them compiled like our own sources. Everything else in
  // node_modules is left alone, which is what the default pattern does.
  transformIgnorePatterns: ['node_modules/(?!.*(otplib|@scure|@noble))'],
  coverageDirectory: 'test-output/jest/coverage',
};
