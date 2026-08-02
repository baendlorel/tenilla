import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsdown';

// find all component directories
function findComponentDirs(): Record<string, string> {
  const src = join(import.meta.dirname, 'src');
  const entries: Record<string, string> = {};
  readdirSync(src, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .forEach(({ name }) => {
      entries[`${name}/${name}`] = join(src, name, name + '.ts');
    });
  return entries;
}

export default defineConfig([
  {
    entry: findComponentDirs(),
    plugins: [],
    outDir: 'dist',
    format: 'esm',
    target: ['es2015', 'es2020'],
    dts: true,
    tsconfig: 'tsconfig.build.json',
    css: { splitting: true, minify: true },
    external: ['@tenilla/core'],
    clean: true,
    minify: true,
  },
]);
