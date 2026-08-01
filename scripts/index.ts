import { existsSync } from 'node:fs';
import path from 'node:path';
import { build } from './build.js';

function main() {
  const [, , cmd, who] = process.argv;
  const dir = path.join(import.meta.dirname, '..', 'packages', who);
  if (!who || !existsSync(dir)) {
    console.error(`Cannot find package "${who}" or "${dir}"`);
    process.exit(1);
  }

  if (cmd === 'build') {
    build(who, dir);
  }
}

main();
