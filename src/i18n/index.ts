import en from './en.json' with { type: 'json' };
import et from './et.json' with { type: 'json' };
import { createTranslator, type Messages, type MessageKey } from './translate.ts';

export { splitAtPlaceholder } from './translate.ts';

// Keep in sync with i18n.locales in astro.config.mjs. English is the default and has no URL prefix.
export const locales = ['en', 'et'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export type UIKey = MessageKey<typeof en>;

const translations: Record<Locale, Messages | undefined> = { en, et };

/** The locale of the current page; pass `Astro.currentLocale`. */
export function getLocale(currentLocale: string | undefined): Locale {
	return locales.find((locale) => locale === currentLocale) ?? defaultLocale;
}

/** Returns `t(key)` for a locale. Empty or missing translations fall back to English. */
export function useTranslations(locale: Locale): (key: UIKey) => string {
	return createTranslator<UIKey>(en, translations[locale]);
}

/**
 * A language's own name in that language ("English", "Eesti"), for the language switch.
 * It comes from the browser-independent Unicode data in Node (Intl), so no Estonian text is
 * written by hand and nothing needs translating in Crowdin.
 */
export function languageName(locale: Locale): string {
	const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
	return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

/** The path of a page without its locale prefix: "/et/privacy/" -> "/privacy/". */
export function pathWithoutLocale(pathname: string): string {
	for (const locale of locales) {
		if (locale === defaultLocale) continue;
		if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
			return pathname.slice(locale.length + 1) || '/';
		}
	}
	return pathname;
}

/**
 * The locales to try, in order, for a page's text in `locale`: the locale itself, then English.
 * A Markdown page arrives from Crowdin only once it is fully translated, so until then the
 * Estonian URL shows the English text.
 */
export function contentLocales(locale: Locale): Locale[] {
	return locale === defaultLocale ? [locale] : [locale, defaultLocale];
}
