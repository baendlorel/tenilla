import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import replace from '@rollup/plugin-replace';

function localPath(relativePath: string) {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

const components = [
  'BooleanInput',
  'Button',
  'CheckboxGroup',
  'DatePicker',
  'DateTimePicker',
  'Grid',
  'Modal',
  'NumberInput',
  'Pagination',
  'RadioGroup',
  'Select',
  'SmartForm',
  'StringInput',
  'TabPanel',
  'TextArea',
  'TimePicker',
  'Tooltip',
  'Tree',
  'TreePanel',
];

export default defineConfig({
  resolve: {
    alias: [
      { find: '@tenilla/core', replacement: localPath('../core/src/index.ts') },
      {
        find: '@tenilla/components/variables.css',
        replacement: localPath('../components/src/variables.css'),
      },
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
    port: 8786,
  },
});
