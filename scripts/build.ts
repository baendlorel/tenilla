import { execSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';

function loadTsConfig(dir: string): { compilerOptions: { outDir: string } } {
  const tsconfigPath = join(dir, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    throw new Error(`tsconfig.json not found in ${dir}`);
  }
  const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');
  return new Function('return ' + tsconfigContent)();
}

function copyCss(srcDir: string, outDir: string) {
  readdirSync(srcDir, { withFileTypes: true })
    .filter((v) => v.isDirectory())
    .forEach((d) => {
      const src = join(srcDir, d.name, `${d.name}.css`);
      const out = join(outDir, d.name, `${d.name}.css`);
      console.log(`Copying CSS from ${relative(srcDir, src)} to ${relative(outDir, out)}`);
      cpSync(src, out, { force: true });
    });
}

export function build(who: string, dir: string) {
  const outDir = loadTsConfig(dir).compilerOptions.outDir;
  console.log('Removing output directory:', outDir);
  rmSync(join(dir, outDir), { recursive: true, force: true });
  console.log('Removing tsbuildinfo file');
  rmSync(join(dir, 'tsconfig.tsbuildinfo'), { recursive: true, force: true });

  console.log(`Building ${who} in ${dir}`);
  execSync(`pnpm build`, { stdio: 'inherit', cwd: dir });

  if (who === 'components') {
    copyCss(join(dir, 'src'), join(dir, outDir));
  }
}
