import { execSync } from 'node:child_process';
import { pkgDir } from './utils.js';

export function build(who: string) {
  const dir = pkgDir(who);
  console.log(`Building ${who} in ${dir}`);
  execSync(`pnpm build`, { stdio: 'inherit', cwd: dir });
}
