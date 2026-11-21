import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import type {TikTokPage} from '@remotion/captions';
import {captionsFromWords} from '../src/captions-from-words';
import {CaptionTrack} from '../src/caption-track';
import {EditorialEmphasis} from '../src/presets/editorial-emphasis';
import {KaraokeFill} from '../src/presets/karaoke-fill';
import {KineticSlam} from '../src/presets/kinetic-slam';
import {NeonGlow} from '../src/presets/neon-glow';
import {PillKaraoke} from '../src/presets/pill-karaoke';
import {WeightShift} from '../src/presets/weight-shift';
import {Bounce} from '../src/presets/bounce';
import {HighlightBox} from '../src/presets/highlight-box';
import {OneWord} from '../src/presets/one-word';
import {PopHighlight} from '../src/presets/pop-highlight';
import {PopIn} from '../src/presets/pop-in';
import type {PresetProps, WordTiming} from '../src/types';
import {useCaptionPages} from '../src/use-caption-pages';
import {LANGUAGE_SAMPLES} from './language-samples';

/**
 * Every preset across ten scripts, each row held mid-line: the check for
 * spacing (none between Japanese, Chinese or Thai words), reading
 * direction (Arabic and Hebrew right to left, fills and underlines
 * sweeping from the right) and wrapping.
 *
 *   pnpm still Languages-KaraokeFill out/languages-karaoke.png --frame=15
 */

type Preset = React.FC<PresetProps & {page: TikTokPage}>;

const FPS = 30;
const ROW = 1920 / Object.keys(LANGUAGE_SAMPLES).length;

const Row: React.FC<{words: WordTiming[]; Preset: Preset}> = ({words, Preset}) => {
	const {captions} = captionsFromWords({words});
	const {pages} = useCaptionPages({captions, maxDurationMs: 2500});
	return (
		<CaptionTrack pages={pages}>
			{(page) => <Preset page={page} theme={{position: 'center', fontSize: 44, maxWidth: 0.9}} />}
		</CaptionTrack>
	);
};

const makeGrid = (Preset: Preset): React.FC => {
	const Grid: React.FC = () => (
		<AbsoluteFill style={{background: 'linear-gradient(160deg, #0b0f1c 0%, #1a1033 55%, #041b14 100%)'}}>
			{Object.entries(LANGUAGE_SAMPLES).map(([lang, words], i) => {
				// Half a second past the middle word, so a fill or sweep is mid-way.
				const at = words[Math.floor(words.length / 2)].start + 0.15;
				return (
					<div key={lang} style={{position: 'absolute', left: 0, right: 0, top: i * ROW, height: ROW}}>
						<div style={{position: 'absolute', left: 16, top: 8, color: '#8899aa', fontSize: 22, fontFamily: 'monospace'}}>
							{lang}
						</div>
						<Sequence from={-Math.round(at * FPS)} layout="none">
							<AbsoluteFill>
								<Row words={words} Preset={Preset} />
							</AbsoluteFill>
						</Sequence>
					</div>
				);
			})}
		</AbsoluteFill>
	);
	return Grid;
};

const GRIDS: [string, Preset][] = [
	['KaraokeFill', KaraokeFill],
	['KineticSlam', KineticSlam],
	['PillKaraoke', PillKaraoke],
	['WeightShift', WeightShift],
	['NeonGlow', NeonGlow],
	['EditorialEmphasis', EditorialEmphasis],
	['PopHighlight', PopHighlight],
	['HighlightBox', HighlightBox],
	['Bounce', Bounce],
	['OneWord', OneWord],
	['PopIn', PopIn],
];

/**
 * One long page in a narrow PillKaraoke. Each word used to carry its space
 * inside a `white-space: pre` span, leaving the line nowhere to wrap, so
 * the pill ran off both edges.
 */
const PillWrap: React.FC = () => {
	const {captions} = captionsFromWords({words: LANGUAGE_SAMPLES.en});
	const {pages} = useCaptionPages({captions, maxDurationMs: 8000, maxCharsPerPage: 120});
	return (
		<AbsoluteFill style={{background: '#1a1033'}}>
			<CaptionTrack pages={pages}>
				{(page) => <PillKaraoke page={page} theme={{position: 'center', fontSize: 64, maxWidth: 0.7}} />}
			</CaptionTrack>
		</AbsoluteFill>
	);
};

export const languageCompositions = [
	<Composition key="PillKaraoke-Wrap" id="PillKaraoke-Wrap" component={PillWrap} durationInFrames={FPS * 8} fps={FPS} width={1080} height={1920} />,
	...GRIDS.map(([id, Preset]) => (
	<Composition
		key={`Languages-${id}`}
		id={`Languages-${id}`}
		component={makeGrid(Preset)}
		durationInFrames={FPS * 2}
		fps={FPS}
		width={1080}
		height={1920}
	/>
	)),
];
