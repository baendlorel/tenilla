import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import replace from '@rollup/plugin-replace';

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
  'StringInput',
  'NumberInput',
  'TextArea',
  'BooleanInput',
  'Select',
  'CheckboxGroup',
  'RadioGroup',
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
  plugins: [
    replace({
      preventAssignment: true,
      values: {
        anynull: 'null',
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 4173,
  },
});
