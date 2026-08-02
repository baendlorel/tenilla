import { build } from './build.js';
import { publish } from './pub.js';
import { findPackageDir } from './utils.js';

async function main() {
  const [, , cmd, who] = process.argv;
  const dir = findPackageDir(who);

  if (cmd === 'build') {
    if (!dir) {
      console.error(`Cannot find package "${who}" or "${dir}"`);
      return;
    }
    build(who);
  } else if (cmd === 'publish') {
    await publish(who);
  } else if (cmd === 'pubminor') {
    await publish(who, 'minor');
  } else if (cmd === 'pubmajor') {
    await publish(who, 'major');
  }
}

main();
