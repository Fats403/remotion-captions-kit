import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {Fragment, type FC} from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {Captions} from '../src/captions';
import type {PresetLayout} from '../src/measure';
import {placementStyle, typeStyle} from '../src/theme';
import {useFitTheme} from '../src/fit';
import type {PresetProps} from '../src/types';
import {useTokenStates} from '../src/use-token-states';
import {SAMPLE_WORDS} from './sample';

/**
 * The README's "Rolling your own style" example, kept here so it compiles
 * and renders (the visual check pins it). Imports differ; the body is the
 * README's.
 */

// How the style sets its words, so pages and auto-shrink measure it right.
const LAYOUT: PresetLayout = {fontWeight: 800, uppercase: true};

// Words appear as they're said, and the spoken one takes activeColor.
export const Reveal: FC<PresetProps & {page: TikTokPage}> = ({page, theme}) => {
	const t = useFitTheme({page, theme, layout: LAYOUT});
	const {tokens, direction} = useTokenStates({page});

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					direction,
					fontFamily: t.fontFamily,
					fontSize: t.fontSize,
					...typeStyle(t, LAYOUT),
					color: t.textColor,
					textAlign: 'center',
				}}
			>
				{tokens.map(({token, text, space, isActive, hasAppeared}) => (
					<Fragment key={token.fromMs}>
						{space}
						<span style={{opacity: hasAppeared ? 1 : 0, color: isActive ? t.activeColor : undefined}}>
							{text}
						</span>
					</Fragment>
				))}
			</div>
		</AbsoluteFill>
	);
};

const CustomStyle: React.FC = () => (
	<AbsoluteFill style={{background: 'linear-gradient(160deg, #3f5f7a 0%, #7a5a3f 55%, #2f4858 100%)'}}>
		<Captions words={SAMPLE_WORDS} preset={Reveal} layout={LAYOUT} theme={{safeArea: 'tiktok'}} />
	</AbsoluteFill>
);

export const customStyleComposition = (
	<Composition key="CustomStyle" id="CustomStyle" component={CustomStyle} durationInFrames={300} fps={30} width={1080} height={1920} />
);
