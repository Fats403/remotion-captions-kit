import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeOutCubic, windowProgress} from '../ease';
import {resolveEmphasis} from '../emphasis';
import {placementStyle, resolveTheme} from '../theme';
import type {PresetProps} from '../types';
import {useTokenStates} from '../use-token-states';

const SHIFT_MS = 160;

/**
 * The quiet one for talking heads: every word is visible, the active word
 * carries the weight (heavier, full opacity, a touch larger) while the
 * rest sit back. No color unless emphasis rules add it.
 */
export const WeightShift: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	const t = resolveTheme(theme);
	const {tokens, timeMs} = useTokenStates({page});

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					fontSize: t.fontSize,
					fontWeight: 500,
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					lineHeight: 1.3,
					textShadow: '0 2px 14px rgba(0,0,0,0.6)',
				}}
			>
				{tokens.map(({token, index, isActive, hasAppeared}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					// Ease in on activation; ease back out when the word ends.
					const inP = easeOutCubic(
						windowProgress(timeMs, token.fromMs, SHIFT_MS),
					);
					const outP = hasAppeared && !isActive
						? easeOutCubic(windowProgress(timeMs, token.toMs, SHIFT_MS))
						: 0;
					const lift = inP * (1 - outP);

					return (
						<span
							key={token.fromMs}
							style={{
								display: 'inline-block',
								whiteSpace: 'pre',
								color: em?.color ?? t.textColor,
								opacity: 0.55 + 0.45 * lift,
								fontWeight: lift > 0.5 ? 800 : 500,
								transform: `scale(${1 + 0.06 * lift})`,
								...em?.style,
							}}
						>
							{token.text}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
