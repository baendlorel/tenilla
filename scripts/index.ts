import { build } from './build.js';
import { publish } from './pub.js';
import { findPackageDir } from './utils.js';

function main() {
  const [, , cmd, who] = process.argv;
  const dir = findPackageDir(who);

  if (cmd === 'build') {
    if (!dir) {
      console.error(`Cannot find package "${who}" or "${dir}"`);
      return;
    }
    build(who);
  } else if (cmd === 'publish') {
    publish(who);
  } else if (cmd === 'pubminor') {
    publish(who, 'minor');
  } else if (cmd === 'pubmajor') {
    publish(who, 'major');
  }
}

main();
