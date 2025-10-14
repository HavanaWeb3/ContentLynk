/**
 * Vitest Setup File
 * Global test configuration and setup
 */

import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

beforeAll(() => {
  console.log('Starting test suite...')
})

afterAll(() => {
  console.log('Test suite completed.')
})

afterEach(() => {
  // Clear all mocks after each test
})
