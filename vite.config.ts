import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export const sharedAlias = {
  '@shared': resolve(__dirname, 'web', '_shared'),
};
export default defineConfig({
  plugins: [vue({})],
  resolve: {
    alias: sharedAlias,
  },
});
