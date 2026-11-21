// Leonida Ledger — a GTA 6 trophy guide for make.fun's gta6-trophy-guide-01.
// Node 22, standard library only. This program hands the guide in: it copies
// this repository's app/ and screenshots/ into the output directory and writes
// output/dossier.json, the summary the judge reads, using the kit's vendored
// library. vendor/makefun-frontend.ts is the kit's copy and must stay as it is:
// the scorer rebuilds the dossier with its own copy and compares the bytes.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's caps for this bounty: the dossier text is capped at 160 KiB,
// at most 4 screenshots of at most 256 KiB each, app/ at most 993 files and
// directories and 48 MiB in all. buildDossier refuses anything past them,
// which is the same refusal the scorer would give.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
