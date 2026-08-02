import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

function localPath(relativePath: string) {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

const components = [
  'DatePicker',
  'DateTimePicker',
  'Grid',
  'Modal',
  'Pagination',
  'SmartForm',
  'TabPanel',
  'TimePicker',
  'Tooltip',
];

export default defineConfig({
  resolve: {
    alias: [
      { find: '@tenilla/core', replacement: localPath('../core/src/index.ts') },
      ...components.flatMap((name) => [
        {
          find: `@tenilla/components/${name}`,
          replacement: localPath(`../components/src/${name}/${name}.ts`),
        },
        {
          find: `@tenilla/components/${name}.css`,
          replacement: localPath(`../components/src/${name}/${name}.css`),
        },
      ]),
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
  },
});
