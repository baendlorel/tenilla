import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    outDir: 'dist',
    format: 'esm',
    target: ['es2015'],
    dts: true,
    tsconfig: 'tsconfig.build.json',
    clean: true,
    minify: true,
  },
]);
