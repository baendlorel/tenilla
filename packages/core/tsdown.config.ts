import { defineConfig } from 'tsdown';
import replace from '@rollup/plugin-replace';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
    },
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          anynull: 'null',
        },
      }),
    ],
    outDir: 'dist',
    format: 'esm',
    target: ['es2015'],
    dts: true,
    tsconfig: 'tsconfig.build.json',
    clean: true,
    minify: true,
  },
]);
