import path from 'node:path';
import fs from 'node:fs';
import { pkgDir, Version, ask } from './utils.js';
import { build } from './build.js';
import { execSync } from 'node:child_process';

function bump(who: string, arg1: 'major' | 'minor' | 'patch' | (string & {})): string {
  const dir = pkgDir(who);
  const packageJsonPath = path.join(dir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  const oldVer = packageJson.version;

  const newVer = Version.parse(oldVer).bump(arg1).toString();
  packageJson.version = newVer;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
  console.log(`${packageJson.name} is bumped from ${oldVer} to ${newVer}`);

  return newVer;
}

/**
 * Params are verified
 */
function pub(who: string) {
  const dir = pkgDir(who);

  if (fs.existsSync(path.join(dir, 'README.md'))) {
    execSync(`rm README.md`, { stdio: 'inherit', cwd: dir });
  }
  execSync(`cp README.md ${dir}/`, { stdio: 'inherit' });
  execSync(`pnpm publish --no-git-checks`, { stdio: 'inherit', cwd: dir });
}

export async function publish(
  who: string | undefined,
  arg1: 'major' | 'minor' | 'patch' = 'patch',
) {
  if (!who) {
    const coreDir = pkgDir('core');
    const coreOldVer = JSON.parse(
      fs.readFileSync(path.join(coreDir, 'package.json'), 'utf-8'),
    ).version;
    const newVer = Version.parse(coreOldVer).bump(arg1).toString();

    console.log(`\nPackages being published:`);
    console.log(`  core:     ${coreOldVer} → ${newVer}`);
    console.log(`  tenilla:  ${coreOldVer} → ${newVer}`);
    console.log();
    await ask('Continue? (Y/n) ');

    bump('core', newVer);
    bump('tenilla', newVer);

    build('core');
    build('tenilla');

    pub('core');
    pub('tenilla');
    console.log('Main entry package published with version', newVer);
    return;
  }

  const dir = pkgDir(who);
  const oldVer = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')).version;
  const newVer = Version.parse(oldVer).bump(arg1).toString();

  console.log(`\nPackages being published:`);
  console.log(`  ${who}:  ${oldVer} → ${newVer}`);
  console.log();
  await ask('Continue? (Y/n) ');

  try {
    bump(who, newVer);
    build(who);
    pub(who);
  } catch (err) {
    console.error('\n❌ Publish failed:', err instanceof Error ? err.message : err);

    // Revert version
    const dir = pkgDir(who);
    const packageJsonPath = path.join(dir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.version = oldVer;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
    console.log(`↩ Version reverted to ${oldVer}`);
    return;
  }
  console.log(`"${who}" published with version`, newVer);
}
