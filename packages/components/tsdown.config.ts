import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsdown';
import replace from '@rollup/plugin-replace';

// find all component directories
function findComponentDirs(): Record<string, string> {
  const src = join(import.meta.dirname, 'src');
  const entries: Record<string, string> = {};
  readdirSync(src, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .forEach(({ name }) => {
      entries[`${name}/${name}`] = join(src, name, name + '.ts');
    });
  // console.log(entries);
  return entries;
}

export default defineConfig([
  {
    entry: {
      ...findComponentDirs(),
      common: join(import.meta.dirname, 'src', 'common.ts'),
      variables: join(import.meta.dirname, 'src', 'variables.css'),
      styles: join(import.meta.dirname, 'src', 'styles.ts'),
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
    css: { splitting: true, minify: true },
    external: ['@tenilla/core'],
    clean: true,
    minify: true,
  },
]);
