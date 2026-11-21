import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {Fragment} from 'react';
import {AbsoluteFill} from 'remotion';
import {easeOutBack, windowProgress} from '../ease';
import {resolveEmphasis} from '../emphasis';
import {useFitTheme} from '../fit';
import {LAYOUTS} from '../layouts';
import {placementStyle, typeStyle} from '../theme';
import type {PresetProps} from '../types';
import {useTokenStates} from '../use-token-states';

const BOUNCE_MS = 220;
const STAGGER_MS = 50;
const POP_MS = 140;

/**
 * Chunky outlined capitals: each page bounces up into place a word after
 * another, every word at a slight tilt, and the spoken one pops in the
 * accent color. The high-energy look of MrBeast's edits. Pair it with one
 * or two words a page.
 */
export const Bounce: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	// A word too long for the line brings the whole page down until it fits.
	const t = useFitTheme({page, theme: {activeColor: '#ffe600', ...theme}, layout: LAYOUTS.Bounce});
	const {tokens, timeMs, direction} = useTokenStates({page});

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					direction,
					fontSize: t.fontSize,
					...typeStyle(t, {fontWeight: 900, uppercase: true, strokeWidth: t.fontSize * 0.09}),
					color: t.textColor,
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					lineHeight: 1.1,
					// The heavy outline eats into a plain space.
					wordSpacing: '0.18em',
					textShadow: `0 ${t.fontSize * 0.08}px 0 rgba(0,0,0,0.6)`,
				}}
			>
				{tokens.map(({token, index, isActive, text, space}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					const p = easeOutBack(windowProgress(timeMs, page.startMs + index * STAGGER_MS, BOUNCE_MS));
					const pop = isActive ? easeOutBack(windowProgress(timeMs, token.fromMs, POP_MS)) : 0;
					const tilt = index % 2 === 0 ? -3 : 3;

					return (
						<Fragment key={token.fromMs}>
							{space}
							<span
								style={{
									display: 'inline-block',
									whiteSpace: 'pre',
									color: isActive ? (em?.color ?? t.activeColor) : (em?.color ?? t.textColor),
									opacity: Math.min(1, p * 2),
									transform: `translateY(${(1 - p) * 0.45}em) scale(${(0.6 + 0.4 * p) * (1 + 0.08 * pop)}) rotate(${tilt * p}deg)`,
									...em?.style,
								}}
							>
								{text}
							</span>
						</Fragment>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
