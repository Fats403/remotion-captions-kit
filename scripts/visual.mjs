// Renders the demo stills that pin down how the presets look and compares each with its
// baseline in demo/baselines, failing when more than 0.1% of a still's pixels change: the
// presets' layout promises (metrics that never move, spacing, wrapping, direction) are visual,
// and unit tests can't see them.
//
//   pnpm test:visual            compare
//   pnpm test:visual --update   record new baselines after a change you meant
//
// Baselines depend on the machine's fonts; these were rendered on macOS. On another OS,
// record your own with --update before comparing.
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';

const CASES = [
	['Showcase', 0],
	['Languages-KaraokeFill', 15],
	['Languages-PillKaraoke', 15],
	['Languages-EditorialEmphasis', 15],
	['Languages-PopHighlight', 15],
	['Languages-HighlightBox', 15],
	['PillKaraoke-Wrap', 60],
	['OneLine-PopHighlight', 60],
	['AutoShrink', 20],
	['CustomStyle', 40],
];

const root = path.resolve(import.meta.dirname, '..');
const baselines = path.join(root, 'demo', 'baselines');
const out = path.join(root, 'out', 'visual');
const update = process.argv.includes('--update');
fs.mkdirSync(out, {recursive: true});
fs.mkdirSync(baselines, {recursive: true});

const serveUrl = await bundle({entryPoint: path.join(root, 'demo', 'index.ts')});
let failed = 0;

for (const [id, frame] of CASES) {
	const file = `${id}-${frame}.png`;
	const rendered = path.join(out, file);
	const baseline = path.join(baselines, file);
	const composition = await selectComposition({serveUrl, id});
	await renderStill({serveUrl, composition, frame, output: rendered, scale: 0.5});

	if (update || !fs.existsSync(baseline)) {
		fs.copyFileSync(rendered, baseline);
		console.log(`recorded ${file}`);
		continue;
	}

	const before = PNG.sync.read(fs.readFileSync(baseline));
	const after = PNG.sync.read(fs.readFileSync(rendered));
	if (before.width !== after.width || before.height !== after.height) {
		console.log(`FAIL ${file}: ${before.width}x${before.height} became ${after.width}x${after.height}`);
		failed++;
		continue;
	}
	const diff = new PNG({width: after.width, height: after.height});
	const changed = pixelmatch(before.data, after.data, diff.data, after.width, after.height, {threshold: 0.1});
	const share = changed / (after.width * after.height);
	if (share > 0.001) {
		fs.writeFileSync(path.join(out, `${id}-${frame}.diff.png`), PNG.sync.write(diff));
		console.log(`FAIL ${file}: ${(share * 100).toFixed(2)}% of pixels changed (diff in out/visual)`);
		failed++;
	} else {
		console.log(`ok   ${file}`);
	}
}

process.exit(failed > 0 ? 1 : 0);
