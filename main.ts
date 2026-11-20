// Trophy Guide entrypoint (Node 22, standard library only). The guide itself is the plain
// static files in app/ (index.html, CSS, ES modules, trophies.json) — no build step, offline.
// This program hands it in: it copies app/ and screenshots/ from beside this file into the
// output directory and writes dossier.json there with the vendored make.fun library.
// vendor/makefun-frontend.ts stays as the kit shipped it: the scorer requires dossier.json
// to be byte for byte what its own copy of the library writes.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Pre-flight: refuse to hand in a broken entry instead of writing a bad dossier.
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error('pre-flight: app/index.html is missing');
}
const shotFiles = existsSync(join(here, 'screenshots'))
  ? readdirSync(join(here, 'screenshots')).filter((f) => /\.(png|jpe?g)$/i.test(f))
  : [];
if (shotFiles.length < 1 || shotFiles.length > 4) {
  throw new Error(`pre-flight: expected 1-4 screenshots, found ${shotFiles.length}`);
}

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

copyTree(join(here, 'app'), join(outDir, 'app'));
if (existsSync(join(here, 'screenshots'))) {
  copyTree(join(here, 'screenshots'), join(outDir, 'screenshots'));
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the others refuse an entry
// the scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files
// and directories in app/ or 48 MiB of app files — app/ counts beside /output's own
// 1000-entry cap, its screenshots/ and dossier.json).
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

// Read the dossier back and check it before reporting success: it must parse as JSON
// and stay under the scorer's 1.5 MiB cap.
const written = readFileSync(join(outDir, 'dossier.json'), 'utf8');
JSON.parse(written);
const writtenBytes = Buffer.byteLength(written, 'utf8');
if (writtenBytes > 1572864) {
  throw new Error(`dossier is ${writtenBytes} bytes, over the 1.5 MiB cap`);
}
console.log(`Trophy Guide: copied app/ and screenshots/, dossier.json is ${writtenBytes} bytes`);
