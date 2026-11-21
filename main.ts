// Leonida Trophy Atlas — the entry program (Node 22, standard library only).
// It hands the guide in: it copies this repository's app/ and screenshots/
// into the output directory and writes /output/dossier.json with the
// vendored make.fun library, the summary the judge reads (the screenshots,
// the first load's files and bytes, and the source). vendor/makefun-frontend.ts
// stays exactly as the kit shipped it: the scorer rebuilds the dossier with
// its own copy and compares the two byte for byte.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root: the directory this file sits in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader gives us /output; anywhere else, MAKEFUN_OUTPUT_DIR stands in.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate's own caps for this bounty (reference/gate.json): the dossier
// text is capped at 160 KiB, screenshots at 4 files of 256 KiB, and app/ at
// 993 files and directories totalling 48 MiB. buildDossier refuses anything
// past them, so an entry that would fail the gate fails loudly here instead.
const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyEntryTree() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  const shotsDir = join(repoRoot, 'screenshots');
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
  }
}

function writeDossier() {
  const dossier = buildDossier(outputDir, dossierOptions);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

// Read the handover back and confirm it is complete before reporting
// success: the dossier must exist, and screenshots/ must hold 3 or 4
// images, the range the gate accepts. A silent partial handover is worse
// than a loud failure, so this throws instead of printing a success line.
function reportHandover() {
  const dossierPath = join(outputDir, 'dossier.json');
  if (!existsSync(dossierPath)) throw new Error('dossier.json was not written');
  const shots = readdirSync(join(outputDir, 'screenshots')).filter((name) =>
    /\.(png|jpe?g)$/i.test(name),
  );
  if (shots.length < 3 || shots.length > 4) {
    throw new Error(`expected 3 or 4 screenshots, found ${shots.length}`);
  }
  const dossierBytes = statSync(dossierPath).size;
  console.log(
    `handed in: app/ + ${shots.length} screenshots + dossier.json (${dossierBytes} bytes) -> ${outputDir}`,
  );
}

copyEntryTree();
writeDossier();
reportHandover();
