import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

function localPath(relativePath: string) {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

export default defineConfig({
  resolve: {
    alias: [
      { find: '@tenilla/core', replacement: localPath('../core/src/index.ts') },
      {
        find: '@tenilla/components/Modal',
        replacement: localPath('../components/src/Modal/Modal.ts'),
      },
      {
        find: '@tenilla/components/Modal.css',
        replacement: localPath('../components/src/Modal/Modal.css'),
      },
      {
        find: '@tenilla/components/Pagination',
        replacement: localPath('../components/src/Pagination/Pagination.ts'),
      },
      {
        find: '@tenilla/components/Pagination.css',
        replacement: localPath('../components/src/Pagination/Pagination.css'),
      },
      {
        find: '@tenilla/components/SmartForm',
        replacement: localPath('../components/src/SmartForm/SmartForm.ts'),
      },
      {
        find: '@tenilla/components/SmartForm.css',
        replacement: localPath('../components/src/SmartForm/SmartForm.css'),
      },
      {
        find: '@tenilla/components/TabPanel',
        replacement: localPath('../components/src/TabPanel/TabPanel.ts'),
      },
      {
        find: '@tenilla/components/TabPanel.css',
        replacement: localPath('../components/src/TabPanel/TabPanel.css'),
      },
      {
        find: '@tenilla/components/Tooltip',
        replacement: localPath('../components/src/Tooltip/Tooltip.ts'),
      },
      {
        find: '@tenilla/components/Tooltip.css',
        replacement: localPath('../components/src/Tooltip/Tooltip.css'),
      },
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
  },
});
