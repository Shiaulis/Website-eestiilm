import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createTranslator, lookup, splitAtPlaceholder, type Messages } from './translate.ts';
import { contentLocales, locales, pathWithoutLocale, useTranslations, type UIKey } from './index.ts';
import en from './en.json' with { type: 'json' };

const source: Messages = {
	nav_home: { message: 'Home', description: 'Home link' },
	nav_privacy: { message: 'Privacy policy', description: 'Privacy link' },
	footer_year: { message: 'Year', description: 'Year label' },
};

test('uses the translation when it is present', () => {
	const t = createTranslator(source, { nav_home: { message: 'Avaleht' } });
	assert.equal(t('nav_home'), 'Avaleht');
});

test('falls back to English when Crowdin exports an empty string', () => {
	const t = createTranslator(source, { nav_home: { message: '' }, nav_privacy: { message: '   ' } });
	assert.equal(t('nav_home'), 'Home');
	assert.equal(t('nav_privacy'), 'Privacy policy');
});

test('falls back to English when the key or the whole file is missing', () => {
	assert.equal(createTranslator(source, { nav_home: { message: 'Avaleht' } })('nav_privacy'), 'Privacy policy');
	assert.equal(createTranslator(source, {})('footer_year'), 'Year');
	assert.equal(createTranslator(source)('footer_year'), 'Year');
});

test('falls back to English when a translation has no message', () => {
	const broken = { nav_home: {} } as unknown as Messages;
	assert.equal(createTranslator(source, broken)('nav_home'), 'Home');
});

test('throws when English has no such string', () => {
	assert.throws(() => createTranslator(source, {})('nav_missing'), /Missing English string "nav_missing"/);
	assert.throws(() => createTranslator(source, {})('toString'), /Missing English string "toString"/);
});

// Crowdin reads en.json as Chrome JSON: flat keys, each with a message and a description.
// Chrome JSON keys allow only ASCII letters, digits and underscores; lowercase keeps them unique
// because Chrome treats keys case-insensitively.
test('every string in en.json has a key Chrome JSON accepts, a message and a description', () => {
	for (const [key, entry] of Object.entries(en)) {
		assert.match(key, /^[a-z][a-z0-9_]*$/, `en.json: "${key}" is not a lowercase Chrome JSON key`);
		assert.deepEqual(Object.keys(entry).sort(), ['description', 'message'], `en.json: "${key}" has other fields`);
		assert.ok(entry.message.trim(), `en.json: "${key}" has no message`);
		assert.ok(entry.description.trim(), `en.json: "${key}" has no description for translators`);
	}
});

test('every locale returns text for every string in en.json', () => {
	for (const key of Object.keys(en) as UIKey[]) {
		assert.equal(lookup(en, key), en[key].message);
		for (const locale of locales) {
			assert.ok(useTranslations(locale)(key).trim(), `${locale}: "${key}" is empty`);
		}
	}
});

test('removes the locale prefix from a path', () => {
	assert.equal(pathWithoutLocale('/'), '/');
	assert.equal(pathWithoutLocale('/privacy/'), '/privacy/');
	assert.equal(pathWithoutLocale('/et/'), '/');
	assert.equal(pathWithoutLocale('/et'), '/');
	assert.equal(pathWithoutLocale('/et/support/'), '/support/');
	assert.equal(pathWithoutLocale('/etc/'), '/etc/');
});

test('splits text at a placeholder', () => {
	assert.deepEqual(splitAtPlaceholder('Data from the agency ({link}).', 'link'), ['Data from the agency (', ').']);
	assert.deepEqual(splitAtPlaceholder('{link} at the start', 'link'), ['', ' at the start']);
});

test('does not split text without exactly one placeholder', () => {
	assert.equal(splitAtPlaceholder('A translation that dropped the link.', 'link'), undefined);
	assert.equal(splitAtPlaceholder('{link} and {link}', 'link'), undefined);
});

test('the English placeholders appear exactly once', () => {
	assert.ok(splitAtPlaceholder(en.footer_data_credit.message, 'link'));
	assert.ok(splitAtPlaceholder(en.page_last_updated.message, 'date'));
	assert.ok(splitAtPlaceholder(en.support_email_body.message, 'link'));
	assert.ok(splitAtPlaceholder(en.support_issue_body.message, 'link'));
});

test('page text is looked up in the page locale first, then in English', () => {
	assert.deepEqual(contentLocales('en'), ['en']);
	assert.deepEqual(contentLocales('et'), ['et', 'en']);
});
