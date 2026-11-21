# Changelog

## 1.0.0

### Added

- **Five presets for the styles short-form editors reach for most.** `PopHighlight` (heavy outlined capitals with the spoken word popping in color, CapCut's standard look and Submagic's "Hormozi"), `HighlightBox` (the spoken word on a block of color), `Bounce` (outlined capitals bouncing in at a tilt, the "Beast" look), `OneWord` (one big word at a time) and `PopIn` (clean words fading and rising in as they're said).
- **`<Captions>`, captions in one line.** Words in, a styled track out: `<Captions words={WORDS} preset="PopHighlight" theme={{safeArea: "tiktok"}} />`. It pages at the preset's own pacing and measures every page.
- **Pages measured in your font.** Given the theme, `useCaptionPages` measures each page on a canvas in the theme's font, size, weight and case, and holds what wraps into `maxLines` lines (default 2), in any script, instead of counting characters. The frame waits with `delayRender` until the font has every character the captions use, so every machine in a split render breaks pages the same way, Chinese and Japanese fonts that Google serves in many files by character included. `createCaptionPages` takes `measure`, `maxLineWidth` and `maxLines` directly.
- **Long words shrink to fit.** A word too long for the line (a German compound, a URL) brings its whole page down until it fits, in every preset, instead of running off the frame. `useFitTheme` gives a custom style the same.
- **`maxWordsPerPage`**, for the styles that read in two or three words.
- **Safe areas.** `theme.safeArea: "tiktok" | "reels" | "shorts" | "all"` clears each platform's buttons and text on a vertical video.
- **Type controls on every preset**: `fontWeight`, `uppercase`, `strokeWidth` and `strokeColor`. The outline is drawn behind the letters, so it never thins them.
- **Subtitle files out.** `pagesToSrt()` and `pagesToVtt()` write the same pages as a cue file, breaking where the captions do.
- **`PRESETS` and `LAYOUTS`**, every preset by name with how it sets its words, for anything that lists or measures the styles.
- **`textDirection`, `tokenSpacing` and `textWidth`**, the script helpers the presets use.
- **An Agent Skill** that teaches Claude Code, Cursor, Codex and other coding agents to caption a Remotion video with the kit: `npx skills add Fats403/remotion-captions-kit`. It also ships in the package at `skills/remotion-captions-kit/SKILL.md`, matching the installed version.

### Languages

- **No spaces where the script has none.** Chinese, Japanese and Thai words sit side by side; every preset put a space between them before.
- **Right to left.** Arabic and Hebrew read from the right in every preset; `KaraokeFill`'s sweep and `EditorialEmphasis`'s underline start from the right. Before, `KaraokeFill` laid Arabic out backwards.
- **Pages break at other scripts' punctuation**: `。！？`, `؟` and `।` end a page, and `，、` and `،` count as clause breaks.
- **Wide characters count double** against the character cap.

### Fixed

- **`edgeOffset` is a fraction of the height, as documented.** It was CSS padding, which measures the width, so `0.18` on a 1080x1920 frame left 194px instead of 346. Placement is now the block's top and bottom edges, which also keeps it right inside a split screen or any smaller container. At `"center"`, `edgeOffset` now lifts the block instead of being ignored.
- **`PillKaraoke` wraps.** Each word carried its space inside a `white-space: pre` span, which left a long line nowhere to break, so the pill ran off both edges.
- **Orphan control no longer welds a sentence end onto the next sentence.** A one-word page at a full stop borrows a word from its own sentence instead (`…antes` / `del amanecer.`, not `amanecer. Para las nueve,`).
- A word that wraps to a new line is centred exactly; its box used to include the space before it.

### Changed

- **Vertical captions sit higher than before.** The `edgeOffset` fix moves every caption placed at `"top"` or `"bottom"` to where the docs always said it was. To keep the old position on a 1080x1920 frame, multiply your `edgeOffset` by 0.5625 (width over height).
- `TokenState` gains `text` and `space`, and `useTokenStates` returns `direction`. Custom styles should draw `space` between the word boxes and set `direction` on the line.
- Without a theme, `useCaptionPages` still caps pages at 42 characters; with one, measured lines replace the cap unless `maxCharsPerPage` is set too.

### Docs

- The README opens on a looping preview of every preset, and a table gives what each one reads from the theme, its pages and its type. It gains a `<Captions>` props table and sections on loading fonts and upgrading from 0.x.
- The custom style example was missing its imports and its theme; it now compiles and runs as written.

### Development

- `pnpm test:visual` renders the demo stills and compares them with `demo/baselines` (baselines from macOS; record your own elsewhere with `--update`).
- The demo adds a language grid for every preset, `PillKaraoke` wrapping, `<Captions>` at a large size and long words.
- Remotion devDependencies at 4.0.534.
- `pnpm gifs` renders the README's preset previews from `demo/Gifs.tsx`. The README's custom style is a demo composition, `CustomStyle`, and the visual check pins it.

## 0.2.0

Whitespace-agnostic input, abbreviation-aware sentence breaks, the character cap, flash-page merging and orphan control.

## 0.1.2

`WeightShift` lifts with text-stroke and scale only, so metrics never change and spacing stays natural.

## 0.1.1

`WeightShift` reserves bold width with centred growth so lines never re-wrap; `text-wrap: balance` on the static presets.

## 0.1.0

Six caption presets, sentence-aware pagination, SRT support and emphasis rules.
