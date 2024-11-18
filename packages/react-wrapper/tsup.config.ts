import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: true,
  clean: true,
  target: ['esnext'],
  format: ['cjs', 'esm'],
  treeshake: true,
  dts: true,
});
