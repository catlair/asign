import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  clean: true,
  platform: 'node',
  shims: true,
  minify: true,
  target: 'node16',
  format: ['cjs', 'esm'],
  dts: true,
})
