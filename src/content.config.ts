// Content collections: text that lives in Markdown files instead of src/i18n/en.json.
//
// `pages` holds the long text of the site's pages, one file per page and locale:
// src/content/pages/en/privacy.md, with the Estonian file from Crowdin at
// src/content/pages/et/privacy.md. Read a page with getPage() from src/i18n/pages.ts, which
// falls back to English while the Estonian file is missing.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Crowdin offers the front matter for translation along with the page text, so translators see
// `title`, `description` and `summary`. `updated` is a date that translators keep as it is.
const pages = defineCollection({
	// Entry ids are "<locale>/<page>", for example "en/privacy".
	loader: glob({ pattern: '*/*.md', base: './src/content/pages' }),
	schema: z.object({
		/** The page's H1 and the first part of its <title>. */
		title: z.string().min(1),
		/** The search result and link preview text. */
		description: z.string().min(1),
		/** The "Last updated" date, as YYYY-MM-DD. */
		updated: z.coerce.date().optional(),
		/** Short points for a summary card at the top of the page. */
		summary: z.array(z.string().min(1)).optional(),
	}),
});

export const collections = { pages };
