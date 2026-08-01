import { execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

function loadTsConfig(dir: string): { compilerOptions: { outDir: string } } {
  const tsconfigPath = join(dir, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    throw new Error(`tsconfig.json not found in ${dir}`);
  }
  const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');
  return new Function('return ' + tsconfigContent)();
}

export function build(who: string, dir: string) {
  const outDir = loadTsConfig(dir).compilerOptions.outDir;
  rmSync(join(dir, outDir), { recursive: true, force: true });
  console.log(`Built ${who} in ${dir}`);
  execSync(`npx tsc`, {
    stdio: 'inherit',
    cwd: dir,
  });
}
