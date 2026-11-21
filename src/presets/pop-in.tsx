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

const RISE_MS = 200;

/**
 * Clean sentence-case words that fade and rise into place as they're said
 * and stay: the calm, educational look (Ali Abdaal's, in Submagic's
 * terms). No outline or color; the reveal is the style. Words hold their
 * place before they appear, so the line never shifts.
 */
export const PopIn: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	// A word too long for the line brings the whole page down until it fits.
	const t = useFitTheme({page, theme, layout: LAYOUTS.PopIn});
	const {tokens, timeMs, direction} = useTokenStates({page});

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					direction,
					fontSize: t.fontSize,
					...typeStyle(t, {fontWeight: 700}),
					color: t.textColor,
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					textWrap: 'balance',
					lineHeight: 1.3,
					textShadow: '0 2px 14px rgba(0,0,0,0.6)',
				}}
			>
				{tokens.map(({token, index, text, space}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					const rise = easeOutCubic(windowProgress(timeMs, token.fromMs, RISE_MS));

					return (
						<Fragment key={token.fromMs}>
							{space}
							<span
								style={{
									display: 'inline-block',
									whiteSpace: 'pre',
									color: em?.color ?? t.textColor,
									opacity: rise,
									transform: `translateY(${(1 - rise) * 0.3}em)`,
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
