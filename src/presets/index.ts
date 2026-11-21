import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import type {CreateCaptionPagesInput} from '../create-caption-pages';
import {LAYOUTS} from '../layouts';
import type {PresetLayout} from '../measure';
import type {PresetProps} from '../types';
import {Bounce} from './bounce';
import {EditorialEmphasis} from './editorial-emphasis';
import {HighlightBox} from './highlight-box';
import {KaraokeFill} from './karaoke-fill';
import {KineticSlam} from './kinetic-slam';
import {NeonGlow} from './neon-glow';
import {OneWord} from './one-word';
import {PillKaraoke} from './pill-karaoke';
import {PopHighlight} from './pop-highlight';
import {PopIn} from './pop-in';
import {WeightShift} from './weight-shift';

export type PresetComponent = React.FC<PresetProps & {page: TikTokPage}>;

export type {PresetLayout} from '../measure';

export type PresetEntry = {
	component: PresetComponent;
	layout: PresetLayout;
	/** The page lengths the style is made for: the short-form looks read in two or three words. */
	pagination?: Partial<Omit<CreateCaptionPagesInput, 'captions'>>;
};

/** Every preset by name, for <Captions preset="…"> and anything that lists the styles. */
export const PRESETS = {
	KaraokeFill: {component: KaraokeFill, layout: LAYOUTS.KaraokeFill},
	KineticSlam: {component: KineticSlam, layout: LAYOUTS.KineticSlam},
	PillKaraoke: {component: PillKaraoke, layout: LAYOUTS.PillKaraoke},
	WeightShift: {component: WeightShift, layout: LAYOUTS.WeightShift},
	NeonGlow: {component: NeonGlow, layout: LAYOUTS.NeonGlow},
	EditorialEmphasis: {component: EditorialEmphasis, layout: LAYOUTS.EditorialEmphasis},
	PopHighlight: {
		component: PopHighlight,
		layout: LAYOUTS.PopHighlight,
		pagination: {maxWordsPerPage: 3},
	},
	HighlightBox: {
		component: HighlightBox,
		layout: LAYOUTS.HighlightBox,
		pagination: {maxWordsPerPage: 3},
	},
	Bounce: {
		component: Bounce,
		layout: LAYOUTS.Bounce,
		pagination: {maxWordsPerPage: 2},
	},
	OneWord: {
		component: OneWord,
		layout: LAYOUTS.OneWord,
		pagination: {maxWordsPerPage: 1, minWordsPerPage: 1},
	},
	PopIn: {component: PopIn, layout: LAYOUTS.PopIn},
} satisfies Record<string, PresetEntry>;

export type PresetName = keyof typeof PRESETS;
