import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {Captions} from '../src/captions';
import {SAMPLE_WORDS} from './sample';

/**
 * <Captions> as a page would use it: one line, pages measured to at most
 * two lines at a large size, inside TikTok's safe area.
 *
 *   pnpm still OneLine out/one-line.png --frame=40
 */
const OneLine: React.FC = () => (
	<AbsoluteFill style={{background: 'linear-gradient(160deg, #3f5f7a 0%, #7a5a3f 55%, #2f4858 100%)'}}>
		<Captions words={SAMPLE_WORDS} preset="KaraokeFill" theme={{fontSize: 110, safeArea: 'tiktok'}} />
	</AbsoluteFill>
);

const OneLineShort: React.FC = () => (
	<AbsoluteFill style={{background: 'linear-gradient(160deg, #3f5f7a 0%, #7a5a3f 55%, #2f4858 100%)'}}>
		<Captions words={SAMPLE_WORDS} preset="PopHighlight" theme={{fontSize: 96, safeArea: 'tiktok'}} />
	</AbsoluteFill>
);

export const oneLineCompositions = [
	<Composition key="OneLine" id="OneLine" component={OneLine} durationInFrames={300} fps={30} width={1080} height={1920} />,
	<Composition key="OneLine-PopHighlight" id="OneLine-PopHighlight" component={OneLineShort} durationInFrames={300} fps={30} width={1080} height={1920} />,
];
