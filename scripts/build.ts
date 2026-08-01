import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { transform } from 'lightningcss';

function loadTsConfig(dir: string): { compilerOptions: { outDir: string } } {
  const tsconfigPath = join(dir, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    throw new Error(`tsconfig.json not found in ${dir}`);
  }
  const tsconfigContent = readFileSync(tsconfigPath, 'utf-8');
  return new Function('return ' + tsconfigContent)();
}

function processCss(srcDir: string, outDir: string) {
  readdirSync(srcDir, { withFileTypes: true })
    .filter((v) => v.isDirectory())
    .forEach((d) => {
      const src = join(srcDir, d.name, `${d.name}.css`);
      const out = join(outDir, d.name, `${d.name}.css`);
      if (!existsSync(src)) {
        console.log(`Skipping CSS for ${d.name} (no CSS file found)`);
        return;
      }
      console.log(`Processing CSS: ${relative(srcDir, src)} -> ${relative(outDir, out)}`);
      const cssContent = readFileSync(src, 'utf-8');
      const result = transform({
        filename: src,
        code: Buffer.from(cssContent),
        minify: true,
      });
      mkdirSync(join(outDir, d.name), { recursive: true });
      writeFileSync(out, result.code);
    });
}

export function build(who: string, dir: string) {
  console.log(`Building ${who} in ${dir}`);
  execSync(`pnpm build`, { stdio: 'inherit', cwd: dir });
}
