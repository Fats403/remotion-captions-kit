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

const SLAM_MS = 180;

/**
 * Bold uppercase words that slam in one by one with a scale overshoot.
 * Words accumulate on screen as they're spoken. Use emphasis rules to
 * throw key words into a different color, that contrast is the style.
 */
export const KineticSlam: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	// A word too long for the line brings the whole page down until it fits.
	const t = useFitTheme({page, theme, layout: LAYOUTS.KineticSlam});
	const {tokens, timeMs, direction} = useTokenStates({page});

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					direction,
					fontSize: t.fontSize,
					...typeStyle(t, {fontWeight: 900, uppercase: true}),
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					lineHeight: 1.15,
					letterSpacing: '0.01em',
					textShadow: '0 3px 0 rgba(0,0,0,0.35), 0 6px 24px rgba(0,0,0,0.5)',
				}}
			>
				{tokens.map(({token, index, hasAppeared, text, space}) => {
					if (!hasAppeared) {
						// Reserve no space: words pop into a line that grows.
						return null;
					}
					const em = resolveEmphasis({token, index, rules: emphasis});
					const p = easeOutBack(windowProgress(timeMs, token.fromMs, SLAM_MS));

					return (
						<Fragment key={token.fromMs}>
							{space}
							<span
								style={{
									display: 'inline-block',
									whiteSpace: 'pre',
									color: em?.color ?? t.textColor,
									transform: `scale(${0.4 + 0.6 * p})`,
									opacity: Math.min(1, p * 2),
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
