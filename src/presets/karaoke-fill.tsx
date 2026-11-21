import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {Fragment} from 'react';
import {AbsoluteFill} from 'remotion';
import {resolveEmphasis} from '../emphasis';
import {useFitTheme} from '../fit';
import {LAYOUTS} from '../layouts';
import {placementStyle, typeStyle} from '../theme';
import type {PresetProps} from '../types';
import {useTokenStates} from '../use-token-states';

/**
 * The classic karaoke: every word is visible; color sweeps through the
 * active word as it is spoken, from the side its line reads from, leaving
 * spoken words filled.
 */
export const KaraokeFill: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	// A word too long for the line brings the whole page down until it fits.
	const t = useFitTheme({page, theme, layout: LAYOUTS.KaraokeFill});
	const {tokens, direction} = useTokenStates({page});

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
					textShadow: '0 2px 12px rgba(0,0,0,0.65)',
				}}
			>
				{tokens.map(({token, index, progress, text, space}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					const fillColor = em?.color ?? t.activeColor;

					return (
						<Fragment key={token.fromMs}>
							{space}
							<span
								style={{
									position: 'relative',
									display: 'inline-block',
									whiteSpace: 'pre',
									color: t.textColor,
									...em?.style,
								}}
							>
								{text}
								{progress > 0 ? (
									<span
										aria-hidden
										style={{
											position: 'absolute',
											inset: 0,
											color: fillColor,
											clipPath:
												direction === 'rtl'
													? `inset(0 0 0 ${(1 - progress) * 100}%)`
													: `inset(0 ${(1 - progress) * 100}% 0 0)`,
										}}
									>
										{text}
									</span>
								) : null}
							</span>
						</Fragment>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
