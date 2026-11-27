// Looks up UI strings by key ("nav_privacy") with an English fallback.
//
// The files use Crowdin's Chrome JSON format: a flat object where each key holds the text in
// `message` and, in English, the translator's context in `description`:
//   { "nav_privacy": { "message": "Privacy policy", "description": "Link to the privacy policy..." } }
//
// Crowdin may export an untranslated or unapproved string as an empty `message`, or leave the
// key out. Both fall back to English, so a page never shows blank text. A key missing from
// English is a bug and fails the build.

export interface Message {
	message: string;
	/** Context for translators, shown in Crowdin's editor. Required in en.json. */
	description?: string;
}

export type Messages = { [key: string]: Message | undefined };

export function lookup(messages: Messages | undefined, key: string): string | undefined {
	const entry = messages && Object.hasOwn(messages, key) ? messages[key] : undefined;
	return typeof entry?.message === 'string' ? entry.message : undefined;
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

/**
 * Splits a string at a `{name}` placeholder, for text with a link in the middle:
 * "Data from the agency ({link})." -> ["Data from the agency (", ")."].
 * Returns undefined when the placeholder is missing or appears more than once (for example a
 * translation that dropped it), so the page can show the text without the link.
 */
export function splitAtPlaceholder(text: string, name: string): [string, string] | undefined {
	const parts = text.split(`{${name}}`);
	return parts.length === 2 ? [parts[0], parts[1]] : undefined;
}
