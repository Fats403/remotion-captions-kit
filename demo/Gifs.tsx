import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {Captions} from '../src/captions';
import {PRESETS, type PresetName} from '../src/presets';
import {LANGUAGE_SAMPLES} from './language-samples';
import {SAMPLE_WORDS} from './sample';

/**
 * The README's looping preview of each preset: the first sentence of the
 * sample, through <Captions> as a user would write it. scripts/gifs.mjs
 * renders them to assets/presets/.
 */
const FPS = 25;
// "every great video starts with a story worth telling,", moved to start on
// the first frame (a GIF's still preview shows it) and held a moment at the end.
const LEAD = 0.25;
const WORDS = SAMPLE_WORDS.filter((w) => w.end <= 3.7).map((w) => ({...w, start: w.start - LEAD, end: w.end - LEAD}));
const DURATION = Math.round((3.7 - LEAD + 0.6) * FPS);

const GRADIENT = 'linear-gradient(160deg, #3f5f7a 0%, #7a5a3f 55%, #2f4858 100%)';
const DARK = 'linear-gradient(160deg, #0b0f1c 0%, #1a1033 55%, #041b14 100%)';

const makeGif = (preset: PresetName): React.FC => {
	const Gif: React.FC = () => (
		<AbsoluteFill style={{background: preset === 'NeonGlow' ? DARK : GRADIENT}}>
			<Captions words={WORDS} preset={preset} theme={{position: 'center', fontSize: 64}} />
		</AbsoluteFill>
	);
	return Gif;
};

// The first sentence of the Arabic sample, reading from the right.
const ARABIC = LANGUAGE_SAMPLES.ar.filter((w) => w.end <= 3.84);
const Arabic: React.FC = () => (
	<AbsoluteFill style={{background: GRADIENT}}>
		<Captions words={ARABIC} preset="KaraokeFill" theme={{position: 'center', fontSize: 64}} />
	</AbsoluteFill>
);

const GIFS: [string, React.FC, number][] = [
	...(Object.keys(PRESETS) as PresetName[]).map((preset): [string, React.FC, number] => [preset, makeGif(preset), DURATION]),
	['KaraokeFill-Arabic', Arabic, Math.round(4.4 * FPS)],
];

export const gifCompositions = GIFS.map(([name, component, duration]) => (
	<Composition key={`Gif-${name}`} id={`Gif-${name}`} component={component} durationInFrames={duration} fps={FPS} width={720} height={480} />
));
