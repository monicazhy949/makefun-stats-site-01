// Japan in Numbers — entry program for the best-national-statistics-site
// bounty. It hands the static site in: copy app/ and screenshots/ from
// beside this file into the output directory, then write dossier.json
// with the vendored make.fun library so the judge can read the entry.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run twice: both runs must write byte-identical output.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

mkdirSync(outDir, { recursive: true });

// Start from a clean slate so a stale file from an earlier run can never
// leak into the submission.
const outApp = join(outDir, 'app');
const outShots = join(outDir, 'screenshots');
if (existsSync(outApp)) rmSync(outApp, { recursive: true, force: true });
if (existsSync(outShots)) rmSync(outShots, { recursive: true, force: true });

cpSync(appDir, outApp, { recursive: true });
mkdirSync(outShots, { recursive: true });
if (existsSync(shotsDir)) cpSync(shotsDir, outShots, { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
