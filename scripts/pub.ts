import path from 'node:path';
import fs from 'node:fs';
import { pkgDir, Version } from './utils.js';
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
  execSync(`npm publish`, { stdio: 'inherit', cwd: pkgDir(who) });
}

export function publish(who: string | undefined, arg1: 'major' | 'minor' | 'patch' = 'patch') {
  if (!who) {
    const newVer = bump('core', arg1);
    bump('tenilla', newVer);

    build('core');
    build('tenilla');

    pub('core');
    pub('tenilla');
    console.log('Main entry package published with version', newVer);
    return;
  }

  const newVer = bump(who, arg1);
  build(who);
  pub(who);
  console.log(`"${who}" published with version`, newVer);
}
