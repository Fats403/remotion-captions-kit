// Renders the README's looping preview of each preset (demo/Gifs.tsx) to
// assets/presets/<Preset>.gif, with Remotion's own ffmpeg: frames as PNGs,
// then one palette per preset so its colors stay clean.
//
//   pnpm gifs                 every preset
//   pnpm gifs PopHighlight    just these
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {getCompositions, renderFrames} from '@remotion/renderer';

const WIDTH = 480;

const root = path.resolve(import.meta.dirname, '..');
const assets = path.join(root, 'assets', 'presets');
const work = path.join(root, 'out', 'gifs');
fs.mkdirSync(assets, {recursive: true});

const serveUrl = await bundle({entryPoint: path.join(root, 'demo', 'index.ts')});
const only = process.argv.slice(2);
const ffmpeg = (...args) => execFileSync('pnpm', ['exec', 'remotion', 'ffmpeg', '-v', 'error', '-y', ...args], {cwd: root, stdio: 'inherit'});

const compositions = (await getCompositions(serveUrl)).filter((c) => c.id.startsWith('Gif-'));

for (const composition of compositions) {
	const preset = composition.id.slice('Gif-'.length);
	if (only.length && !only.includes(preset)) {
		continue;
	}
	const frames = path.join(work, preset);
	fs.rmSync(frames, {recursive: true, force: true});
	await renderFrames({
		serveUrl,
		composition,
		imageFormat: 'png',
		outputDir: frames,
		inputProps: {},
		onStart: () => {},
		onFrameUpdate: () => {},
	});
	// renderFrames pads frame numbers to the composition's length: element-000.png …
	const digits = fs.readdirSync(frames)[0].match(/(\d+)\.png$/)[1].length;
	const input = ['-framerate', String(composition.fps), '-i', path.join(frames, `element-%0${digits}d.png`)];
	const palette = path.join(work, `${preset}-palette.png`);
	ffmpeg(...input, '-vf', `scale=${WIDTH}:-1:flags=lanczos,palettegen=stats_mode=diff`, palette);
	const gif = path.join(assets, `${preset}.gif`);
	ffmpeg(...input, '-i', palette, '-lavfi', `scale=${WIDTH}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, '-loop', '0', gif);
	console.log(`${preset}.gif  ${(fs.statSync(gif).size / 1024).toFixed(0)} KB`);
}
