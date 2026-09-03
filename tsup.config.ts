import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['cjs'],
  target: 'node18',
  platform: 'node',
  bundle: true,
  // Bundle everything so the single file works both as an npm bin and inside a
  // packaged binary (pkg).
  noExternal: [/.*/],
  clean: true,
  sourcemap: false,
  minify: false,
  outExtension() {
    return { js: '.cjs' };
  },
  banner: { js: '#!/usr/bin/env node' },
});
