import { existsSync } from 'node:fs';
import path from 'node:path';

function main() {
  const [, , who] = process.argv;
  const dir = path.join(import.meta.dirname, '..', 'packages', who);
  if (!who || !existsSync(dir)) {
    console.error(`Cannot find package "${who}" or "${dir}"`);
    process.exit(1);
  }
}
