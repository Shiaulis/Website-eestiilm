import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createTranslator, lookup, type Messages } from './translate.ts';
import { locales, pathWithoutLocale, useTranslations } from './index.ts';
import en from './en.json' with { type: 'json' };

const source: Messages = { nav: { home: 'Home', privacy: 'Privacy policy' }, footer: { year: 'Year' } };

test('uses the translation when it is present', () => {
	const t = createTranslator(source, { nav: { home: 'Avaleht' } });
	assert.equal(t('nav.home'), 'Avaleht');
});

test('falls back to English when Crowdin exports an empty string', () => {
	const t = createTranslator(source, { nav: { home: '', privacy: '   ' } });
	assert.equal(t('nav.home'), 'Home');
	assert.equal(t('nav.privacy'), 'Privacy policy');
});

test('falls back to English when the key or the whole file is missing', () => {
	assert.equal(createTranslator(source, { nav: {} })('nav.privacy'), 'Privacy policy');
	assert.equal(createTranslator(source, {})('footer.year'), 'Year');
	assert.equal(createTranslator(source)('footer.year'), 'Year');
});

test('throws when English has no such string', () => {
	assert.throws(() => createTranslator(source, {})('nav.missing'), /Missing English string "nav.missing"/);
	assert.throws(() => createTranslator(source, {})('nav'), /Missing English string "nav"/);
});

function keys(messages: Messages, prefix = ''): string[] {
	return Object.entries(messages).flatMap(([key, value]) =>
		typeof value === 'string' ? [`${prefix}${key}`] : keys(value, `${prefix}${key}.`),
	);
}

test('every string in en.json is non-empty, and every locale returns text for it', () => {
	for (const key of keys(en)) {
		assert.ok(lookup(en, key)?.trim(), `en.json: "${key}" is empty`);
		for (const locale of locales) {
			assert.ok(useTranslations(locale)(key as never).trim(), `${locale}: "${key}" is empty`);
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
