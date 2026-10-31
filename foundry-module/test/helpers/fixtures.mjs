// Shared test helpers (no tests in this file).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');

export const FIXTURES = ['open-map', 'walled-corridor', 'melee-duel', 'hex-map'];

/** Fresh deep copy of a fixture snapshot each call. */
export function loadFixture(name) {
  return JSON.parse(readFileSync(join(DIR, `${name}.json`), 'utf8'));
}

/** Small deterministic PRNG (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
