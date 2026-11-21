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

const GLOW_MS = 150;

/**
 * TikTok-night-mode: the active word ignites in the accent color with a
 * layered glow; spoken words keep a faint afterglow so the line reads as
 * lit-up-so-far.
 */
export const NeonGlow: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	// A word too long for the line brings the whole page down until it fits.
	const t = useFitTheme({page, theme, layout: LAYOUTS.NeonGlow});
	const {tokens, timeMs, direction} = useTokenStates({page});

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					direction,
					fontSize: t.fontSize,
					...typeStyle(t, {fontWeight: 800}),
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					textWrap: 'balance',
					lineHeight: 1.25,
				}}
			>
				{tokens.map(({token, index, isActive, hasAppeared, text, space}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					const glowColor = em?.color ?? t.activeColor;
					const ignite = easeOutCubic(
						windowProgress(timeMs, token.fromMs, GLOW_MS),
					);
					// Full glow while active, settling to an afterglow once done.
					const glow = isActive ? ignite : hasAppeared ? 0.35 : 0;

					return (
						<Fragment key={token.fromMs}>
							{space}
							<span
								style={{
									display: 'inline-block',
									whiteSpace: 'pre',
									color: glow > 0 ? glowColor : t.textColor,
									opacity: hasAppeared || isActive ? 1 : 0.75,
									textShadow:
										glow > 0
											? `0 0 ${8 * glow}px ${glowColor}, 0 0 ${24 * glow}px ${glowColor}, 0 0 ${56 * glow}px ${glowColor}, 0 2px 10px rgba(0,0,0,0.6)`
											: '0 2px 10px rgba(0,0,0,0.6)',
									transform: `scale(${1 + 0.05 * (isActive ? ignite : 0)})`,
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
