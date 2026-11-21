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

const WORD_FADE_MS = 140;

/**
 * The whole line sits in a rounded light pill; words start muted and turn
 * dark the moment they're spoken. (The HeyGen "Pill Karaoke" look.)
 *
 * textColor is the SPOKEN color here (dark ink on the light pill);
 * unspoken words render in a muted version via opacity, so one theme
 * works across pill colors.
 */
export const PillKaraoke: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	// A word too long for the line brings the whole page down until it fits.
	const t = useFitTheme({page, theme: {textColor: '#1e1e20', ...theme}, layout: LAYOUTS.PillKaraoke});
	const {tokens, timeMs, direction} = useTokenStates({page});

	// Pill scales in gently when the page lands.
	const enter = easeOutCubic(windowProgress(timeMs, page.startMs, 160));

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					direction,
					fontSize: t.fontSize,
					...typeStyle(t, {fontWeight: 800}),
					whiteSpace: 'pre-wrap',
					textWrap: 'balance',
					textAlign: 'center',
					lineHeight: 1.2,
					backgroundColor: t.pillColor,
					borderRadius: t.fontSize * 0.45,
					padding: `${t.fontSize * 0.28}px ${t.fontSize * 0.55}px`,
					transform: `scale(${0.92 + 0.08 * enter})`,
					opacity: enter,
					boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
				}}
			>
				{tokens.map(({token, index, text, space}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					const fade = easeOutCubic(
						windowProgress(timeMs, token.fromMs, WORD_FADE_MS),
					);

					return (
						<Fragment key={token.fromMs}>
							{space}
							<span
								style={{
									whiteSpace: 'pre',
									color: em?.color ?? t.textColor,
									opacity: 0.35 + 0.65 * fade,
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
