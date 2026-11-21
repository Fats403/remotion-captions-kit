import type {Caption} from '@remotion/captions';
import type React from 'react';
import {useMemo} from 'react';
import {CaptionTrack} from './caption-track';
import {captionsFromWords} from './captions-from-words';
import type {CreateCaptionPagesInput} from './create-caption-pages';
import {PRESETS, type PresetComponent, type PresetEntry, type PresetLayout, type PresetName} from './presets';
import type {CaptionTheme, EmphasisRule, WordTiming} from './types';
import {useCaptionPages} from './use-caption-pages';

export type CaptionsProps = {
	/** Word timings, as speech pipelines emit them. */
	words?: WordTiming[];
	/** Or captions already in @remotion/captions' shape (parseSrt, Whisper). */
	captions?: Caption[];
	/** Unit of `words`' start and end. Default "seconds". */
	timeUnit?: 'seconds' | 'milliseconds';
	/** A preset by name, or any component that takes a page. Default "PillKaraoke". */
	preset?: PresetName | PresetComponent;
	/** How a custom preset sets its words, for measuring. Named presets bring their own. */
	layout?: PresetLayout;
	theme?: CaptionTheme;
	emphasis?: EmphasisRule[];
	/** Pagination over the preset's own defaults. */
	pagination?: Partial<Omit<CreateCaptionPagesInput, 'captions' | 'measure' | 'maxLineWidth'>>;
};

/**
 * Captions in one line: words in, a styled track out. Pages are sized by
 * measured width to at most two lines, at the preset's own pacing (two or
 * three words for the short-form styles, one for OneWord), and every page
 * goes through the preset.
 *
 *   <Captions words={WORDS} preset="PopHighlight" theme={{safeArea: 'tiktok'}} />
 */
export const Captions: React.FC<CaptionsProps> = ({
	words,
	captions,
	timeUnit,
	preset = 'PillKaraoke',
	layout,
	theme,
	emphasis,
	pagination,
}) => {
	const entry: PresetEntry =
		typeof preset === 'string'
			? PRESETS[preset]
			: {component: preset, layout: layout ?? {fontWeight: 800}};
	const input = useMemo(
		() => captions ?? captionsFromWords({words: words ?? [], timeUnit}).captions,
		[captions, words, timeUnit],
	);
	const {pages} = useCaptionPages({
		captions: input,
		...entry.pagination,
		...pagination,
		theme: theme ?? {},
		layout: entry.layout,
	});
	const Preset = entry.component;

	return (
		<CaptionTrack pages={pages}>
			{(page) => <Preset page={page} theme={theme} emphasis={emphasis} />}
		</CaptionTrack>
	);
};
