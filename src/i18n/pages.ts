// Reads a page's text from the `pages` content collection (src/content/pages/<locale>/<page>.md).
import { getCollection, render, type CollectionEntry } from 'astro:content';
import { contentLocales, type Locale } from './index.ts';

export interface Page {
	entry: CollectionEntry<'pages'>;
	/** The locale of the text that was found: English while the translation is missing. */
	locale: Locale;
	/** The rendered Markdown and its headings (for an "On this page" list). */
	rendered: Awaited<ReturnType<typeof render>>;
}

/**
 * Returns the page `name` ("privacy") in `locale`, or in English when the locale has no file yet.
 * Fails the build when even the English file is missing.
 */
export async function getPage(name: string, locale: Locale): Promise<Page> {
	// getCollection instead of getEntry: getEntry logs a warning for every missing translation.
	const entries = await getCollection('pages');
	for (const candidate of contentLocales(locale)) {
		const entry = entries.find((e) => e.id === `${candidate}/${name}`);
		if (entry) return { entry, locale: candidate, rendered: await render(entry) };
	}
	throw new Error(`Missing page text: src/content/pages/en/${name}.md`);
}
