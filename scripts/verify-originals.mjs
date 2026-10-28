import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../audit/original-manifest.json', import.meta.url), 'utf8'));
for (const [file, expected] of Object.entries(manifest)) {
  const actual = createHash('sha256').update(readFileSync(resolve(root, file))).digest('hex');
  if (actual !== expected) throw new Error(`Original changed: ${file}`);
}
console.log(`All ${Object.keys(manifest).length} original files are byte-for-byte unchanged.`);
