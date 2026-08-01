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

export default defineConfig({
  entry: {
    // index: 'src/index.ts',
    // 'Modal/Modal': 'src/Modal/Modal.ts',
    // 'Pagination/Pagination': 'src/Pagination/Pagination.ts',
    // 'Tooltip/Tooltip': 'src/Tooltip/Tooltip.ts',
    // 'SmartForm/SmartForm': 'src/SmartForm/SmartForm.ts',
    // 'TabPanel/TabPanel': 'src/TabPanel/TabPanel.ts',
    ...findComponentDirs(),
  },
  plugins: [],
  outDir: 'dist',
  format: 'esm',
  dts: true,
  tsconfig: 'tsconfig.build.json',
  css: { splitting: true, minify: true },
  external: ['@tenilla/core'],
  clean: true,
});
