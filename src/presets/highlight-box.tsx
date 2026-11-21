import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {Fragment} from 'react';
import {AbsoluteFill} from 'remotion';
import {easeOutCubic, windowProgress} from '../ease';
import {resolveEmphasis} from '../emphasis';
import {useFitTheme} from '../fit';
import {LAYOUTS} from '../layouts';
import {placementStyle, typeStyle} from '../theme';
import type {PresetProps} from '../types';
import {useTokenStates} from '../use-token-states';

const BOX_MS = 110;

/**
 * Bold capitals with the spoken word set on a rounded block of the accent
 * color, which jumps from word to word: the boxed version of the
 * short-form look (Submagic's boxed Hormozi styles). The box sits behind
 * the letters and never changes their spacing.
 */
export const HighlightBox: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	// A word too long for the line brings the whole page down until it fits.
	const t = useFitTheme({page, theme: {activeColor: '#8b5cf6', ...theme}, layout: LAYOUTS.HighlightBox});
	const {tokens, timeMs, direction} = useTokenStates({page});

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					direction,
					fontSize: t.fontSize,
					...typeStyle(t, {fontWeight: 800, uppercase: true}),
					color: t.textColor,
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					textWrap: 'balance',
					lineHeight: 1.3,
					// Room for the box to reach past the word without touching the next.
					wordSpacing: '0.24em',
					textShadow: '0 2px 10px rgba(0,0,0,0.45)',
				}}
			>
				{tokens.map(({token, index, isActive, text, space}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					const grow = easeOutCubic(windowProgress(timeMs, token.fromMs, BOX_MS));

					return (
						<Fragment key={token.fromMs}>
							{space}
							<span
								style={{
									position: 'relative',
									display: 'inline-block',
									whiteSpace: 'pre',
									isolation: 'isolate',
									color: em?.color ?? t.textColor,
									...em?.style,
								}}
							>
								{isActive ? (
									<span
										aria-hidden
										style={{
											position: 'absolute',
											inset: '-0.04em -0.18em',
											zIndex: -1,
											borderRadius: '0.2em',
											backgroundColor: t.activeColor,
											transform: `scale(${0.85 + 0.15 * grow})`,
											opacity: grow,
										}}
									/>
								) : null}
								{text}
							</span>
						</Fragment>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
