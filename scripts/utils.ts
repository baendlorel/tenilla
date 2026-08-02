import { existsSync } from 'node:fs';
import path from 'node:path';

export function findPackageDir(who: string): string | undefined {
  const dir = path.join(import.meta.dirname, '..', 'packages', who);
  if (!who || !existsSync(dir)) {
    console.error(`Cannot find package "${who}" or "${dir}"`);
    return undefined;
  }
  return dir;
}

export function pkgDir(who: string): string {
  const dir = findPackageDir(who);
  if (!dir) {
    throw new Error(`Cannot find package "${who}"`);
  }
  return dir;
}

export class Version {
  major: number;
  minor: number;
  patch: number;

  constructor(major: number, minor: number, patch: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  static parse(versionStr: string): Version {
    const [major, minor, patch] = versionStr.split('.').map(Number);
    return new Version(major, minor, patch);
  }

  /**
   * Bump `this` or parse a version string and return a new Version instance
   */
  bump(type: 'major' | 'minor' | 'patch' | (string & {})): Version {
    switch (type) {
      case 'major':
        return new Version(this.major + 1, 0, 0);
      case 'minor':
        return new Version(this.major, this.minor + 1, 0);
      case 'patch':
        return new Version(this.major, this.minor, this.patch + 1);
      default:
        return Version.parse(type);
    }
  }

  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}
