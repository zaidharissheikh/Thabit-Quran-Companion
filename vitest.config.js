import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    globalSetup: ['./tests/globalSetup.js'],
    setupFiles: ['./tests/setup.js'],
    testTimeout: 30_000,
    hookTimeout: 180_000,
    fileParallelism: false,
    poolOptions: {
      threads: { singleThread: true },
    },
  },
});
