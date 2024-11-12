import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    hookTimeout: 1e9,
    testTimeout: 1e9,
  },
});
