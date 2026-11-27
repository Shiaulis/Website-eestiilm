// @ts-check
import { defineConfig } from 'astro/config';

// Page URLs stored in App Store Connect and in the app repo's fastlane/metadata/.
// They must never change: the build fails if any of them is missing from dist/.
const FIXED_URLS = ['/', '/et/', '/privacy/', '/et/privacy/', '/support/', '/et/support/'];

/** @returns {import('astro').AstroIntegration} */
function checkFixedUrls() {
	return {
		name: 'eestiilm:check-fixed-urls',
		hooks: {
			'astro:build:done': ({ pages, logger }) => {
				// Astro lists built pages without the leading slash: "" for the home page, "et/privacy/".
				const built = new Set(pages.map((page) => `/${page.pathname}`));
				const missing = FIXED_URLS.filter((url) => !built.has(url));
				if (missing.length > 0) {
					throw new Error(`Fixed URLs missing from the build: ${missing.join(', ')}. They must never move.`);
				}
				logger.info(`All ${FIXED_URLS.length} fixed URLs are in the build.`);
			},
		},
	};
}

// https://astro.build/config
export default defineConfig({
	site: 'https://eestiilm.app',
	// Every page URL ends with a slash (/privacy/), the form stored in App Store Connect.
	trailingSlash: 'always',
	// English has no prefix (/privacy/), Estonian lives under /et/ (/et/privacy/).
	// Keep the locales in sync with src/i18n/index.ts.
	i18n: {
		locales: ['en', 'et'],
		defaultLocale: 'en',
		routing: {
			prefixDefaultLocale: false,
		},
	},
	// Content-Security-Policy: Astro adds a <meta> CSP to every page with sha256 hashes of its own
	// inline scripts and styles (computed at build time, so they never go stale). The directives
	// that don't depend on hashes and must cover the whole response (frame-ancestors can't go in a
	// <meta> tag at all) are sent as a second policy header from public/.htaccess.
	security: {
		csp: {
			directives: [
				"default-src 'self'",
				"img-src 'self'",
				"font-src 'self'",
				"connect-src 'self'",
				'upgrade-insecure-requests',
			],
		},
	},
	// Shiki colours code blocks with inline style="" attributes, which the CSP above blocks.
	// The site's Markdown has no code blocks.
	markdown: {
		syntaxHighlight: false,
	},
	integrations: [checkFixedUrls()],
});
