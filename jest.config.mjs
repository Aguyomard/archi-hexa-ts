// jest.config.mjs
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { defaultsESM } = require('ts-jest/presets')

export default {
  ...defaultsESM,
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['**/__tests__/**/*.test.ts'],
}
