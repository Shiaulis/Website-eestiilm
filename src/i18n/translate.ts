// Looks up UI strings by dotted key ("nav.privacy") with an English fallback.
//
// Crowdin keeps every key in a translated file and leaves untranslated or unapproved strings
// as empty strings (""). Both empty and missing translations fall back to English, so a page
// never shows blank text. A key missing from English is a bug and fails the build.

export type Messages = { [key: string]: string | Messages };

/** Dotted paths of every string in `T`, e.g. "nav.home" | "nav.privacy". */
export type MessageKey<T, Prefix extends string = ''> = {
	[K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : MessageKey<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export function lookup(messages: Messages | undefined, key: string): string | undefined {
	let node: string | Messages | undefined = messages;
	for (const part of key.split('.')) {
		if (node === undefined || typeof node === 'string') return undefined;
		node = node[part];
	}
	return typeof node === 'string' ? node : undefined;
}

export function createTranslator<Key extends string = string>(
	source: Messages,
	translation?: Messages,
): (key: Key) => string {
	return (key) => {
		const translated = lookup(translation, key);
		if (translated !== undefined && translated.trim() !== '') return translated;
		const english = lookup(source, key);
		if (english === undefined || english.trim() === '') {
			throw new Error(`Missing English string "${key}" in src/i18n/en.json`);
		}
		return english;
	};
}
