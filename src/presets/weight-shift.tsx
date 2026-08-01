import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {Fragment} from 'react';
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
					textWrap: 'balance',
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

					// The leading space stays OUTSIDE the sized box at constant
					// weight. Boxing it with the word would center "space+word"
					// as one unit, so the bold state (which fills the box) would
					// sit visibly left of the light state.
					const lead = token.text.match(/^\s*/)?.[0] ?? '';
					const word = token.text.slice(lead.length);

					return (
						// The lead space sits directly in the pre-wrap container,
						// so it is preserved AND remains a soft-wrap opportunity.
						<Fragment key={token.fromMs}>
							{lead}
							<span
								style={{position: 'relative', display: 'inline-block'}}
							>
								{/* Invisible sizer at the heaviest weight the word can
								    reach: the layout box never changes as the weight
								    shifts, so the line can never re-wrap mid-page, and
								    the word grows symmetrically around its own center. */}
								<span
									aria-hidden
									style={{visibility: 'hidden', fontWeight: 800, ...em?.style}}
								>
									{word}
								</span>
								<span
									style={{
										position: 'absolute',
										inset: 0,
										textAlign: 'center',
										whiteSpace: 'pre',
										color: em?.color ?? t.textColor,
										opacity: 0.55 + 0.45 * lift,
										fontWeight: lift > 0.5 ? 800 : 500,
										transform: `scale(${1 + 0.06 * lift})`,
										...em?.style,
									}}
								>
									{word}
								</span>
							</span>
						</Fragment>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
