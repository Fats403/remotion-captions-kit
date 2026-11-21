import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {Captions} from '../src/captions';
import type {PresetName} from '../src/presets';
import type {WordTiming} from '../src/types';

/**
 * Words too long for the line, at sizes where they can't fit: each row's
 * page comes down until its widest word fits, instead of running off the
 * frame.
 *
 *   pnpm still AutoShrink out/auto-shrink.png --frame=20
 */
const LONG: WordTiming[] = [
	{word: 'Donaudampfschifffahrtsgesellschaft', start: 0, end: 0.9},
	{word: 'sagt', start: 0.9, end: 1.2},
];
const URL_WORDS: WordTiming[] = [
	{word: 'videoventure.ai/studio', start: 0, end: 1.2},
];

const Row: React.FC<{words: WordTiming[]; preset: PresetName; top: number}> = ({words, preset, top}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top, height: 640, borderBottom: '1px solid #334'}}>
		<div style={{position: 'absolute', left: 16, top: 10, color: '#8899aa', fontFamily: 'monospace', fontSize: 24}}>{preset}</div>
		<Captions words={words} preset={preset} theme={{position: 'center', fontSize: 120}} />
	</div>
);

const AutoShrink: React.FC = () => (
	<AbsoluteFill style={{background: 'linear-gradient(160deg, #3f5f7a 0%, #7a5a3f 55%, #2f4858 100%)'}}>
		<Row words={LONG} preset="PopHighlight" top={0} />
		<Row words={URL_WORDS} preset="OneWord" top={640} />
		<Row words={LONG} preset="PillKaraoke" top={1280} />
	</AbsoluteFill>
);

export const autoShrinkComposition = (
	<Composition key="AutoShrink" id="AutoShrink" component={AutoShrink} durationInFrames={45} fps={30} width={1080} height={1920} />
);
