// Crowdin's GitHub integration exports an untranslated Markdown string as the English text, so its
// PR can look ready while an Estonian page still has English on it. This fails on any line of an
// Estonian page that is also a line of the English page with the same name. It compares whole
// lines, so a line that is only partly translated passes.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

// Lines that are rightly the same in both languages. Add one only when a page needs it, with a
// comment saying why.
const sameInBothLanguages = new Set([
	// Front matter key above the summary points. Keys are never translated; the points are.
	'summary:',
]);

function untranslatedLines(english: string, estonian: string): { line: number; text: string }[] {
	const englishLines = new Set(english.split('\n').map((text) => text.trimEnd()));
	return estonian
		.split('\n')
		.map((text, index) => ({ line: index + 1, text: text.trimEnd() }))
		.filter(
			({ text }) =>
				text !== '' &&
				text !== '---' && // front matter delimiter
				!text.startsWith('updated:') && // a date, the same in every language
				!sameInBothLanguages.has(text) &&
				englishLines.has(text),
		);
}

test('finds the lines left in English', () => {
	const english = '---\ntitle: Support\nupdated: 2026-11-27\nsummary:\n  - No ads.\n---\n\n## Contact\n\nWrite to us.\n';
	const estonian = '---\ntitle: Tugi\nupdated: 2026-11-27\nsummary:\n  - No ads.\n---\n\n## Kontakt\n\nWrite to us.\n';
	assert.deepEqual(untranslatedLines(english, estonian), [
		{ line: 5, text: '  - No ads.' },
		{ line: 10, text: 'Write to us.' },
	]);
});

test('no Estonian page has a line left in English', () => {
	const pages = new URL('../content/pages/', import.meta.url);
	const found = readdirSync(new URL('en/', pages))
		.filter((name) => name.endsWith('.md'))
		.flatMap((name) => {
			const estonian = new URL(`et/${name}`, pages);
			// No Estonian file yet: the site shows the English page.
			if (!existsSync(estonian)) return [];
			const english = readFileSync(new URL(`en/${name}`, pages), 'utf8');
			return untranslatedLines(english, readFileSync(estonian, 'utf8')).map(
				({ line, text }) => `src/content/pages/et/${name}:${line}: ${text}`,
			);
		});
	assert.ok(
		found.length === 0,
		[
			'These lines are the same as in English. Translate them in Crowdin before merging its PR.',
			'If a line is rightly the same in both languages, add it to sameInBothLanguages in src/i18n/untranslated.test.ts.',
			...found,
		].join('\n'),
	);
});
