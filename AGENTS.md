# AGENTS.md

## Overview

The website for Eesti Ilm, an iOS weather app for Estonia, at [eestiilm.app](https://eestiilm.app). It introduces the app and hosts the pages App Store Connect requires: a privacy policy and a support page. The app itself lives in a separate repo, [Shiaulis/Eesti-Ilm](https://github.com/Shiaulis/Eesti-Ilm).

This file describes the setup; update it in the same PR that changes the setup.

## Communication

The owner is an iOS developer, not primarily a web developer. On every web change (Astro, HTML, CSS, SEO, CI), include a very brief explanation of why the change is needed and what practical difference it makes.

## Stack

- [Astro](https://astro.build), static output only (no server rendering). No client-side JavaScript unless a feature needs it.
- Node.js 24 in CI.
- Commands: `npm run dev` (local server), `npm run check` (type check), `npm test` (unit tests with Node's built-in test runner), `npm run build` (writes `dist/`). CI runs check, test and build on every PR.
- The deploy setup follows the owner's other Astro site, [Shiaulis/Website-telbin.dev](https://github.com/Shiaulis/Website-telbin.dev): reuse its patterns (workflows, `.htaccess`, SHA-pinned actions) instead of inventing new ones.

## Layout

- `src/pages/`: one file per URL. English pages sit at the root, Estonian pages under `src/pages/et/`.
- `src/views/`: page bodies shared by the English and Estonian route files.
- `src/layouts/BaseLayout.astro`: `<head>` (title, description, canonical, `hreflang`, `color-scheme`, icons, Open Graph and Twitter card tags), header, horizon line and footer.
- `src/components/`: the header (icon, wordmark, page links, EN / ET switch) and the footer (links, data credit, copyright).
- `src/i18n/`: UI strings (`en.json`, `et.json`) and the `useTranslations(locale)` helper.
- `src/site.ts`: untranslated constants (app name, site URL, GitHub link, data source link).
- `src/styles/global.css`: palette, font and base styles shared by every page.
- `public/`: static files served as they are: icons, share image, `fonts/` and `.htaccess`.
- `public/.htaccess`: Apache settings on Hostinger (www redirect, security headers, caching, the English 404 page).
- `public/et/.htaccess`: only the Estonian 404 page for missing URLs under `/et/`; every other setting comes from the root file.

## Pages

Planned for the first version:

- Landing page: what the app does, screenshots, App Store link (once the app is back on the App Store).
- Privacy policy: the App Store Connect Privacy Policy URL.
- Support: contact and FAQ, the App Store Connect Support URL.
- 404 page, served by Apache for missing URLs: `/404.html` in English, `/et/404/index.html` for misses under `/et/`. It has `noindex` and no canonical or `hreflang` links, because it has no address of its own.

Do not rename or move these URLs: they are stored in App Store Connect and in the app repo's `fastlane/metadata/`.

- `/privacy/` and `/et/privacy/`
- `/support/` and `/et/support/`

`FIXED_URLS` in `astro.config.mjs` lists them with `/` and `/et/`, and the build fails if any of them is missing.

## Requirements

- Light and dark mode follow the system setting.
- Every page has a `lang` attribute and `hreflang` links to its English and Estonian versions.
- Smart App Banner: the `apple-itunes-app` meta tag (app id 1534551991), once the app is live on the App Store again.
- Open Graph and Twitter card tags with a share image.
- Accessible: real headings, alt text, good contrast, keyboard friendly.
- No cookies, tracking or third-party requests, so no cookie banner.

## Design

Follow the design book's Website section: `ReleaseRelatedInfo/DesignBook/index.html#website` in Shiaulis/Eesti-Ilm, on `master`. It is the source of truth for the look; don't invent colours, fonts, icons or components it doesn't define.

- Colours are the Loojang palette, as CSS variables in `src/styles/global.css`, with light and dark values that follow the system setting. Text pairs must pass WCAG AA (4.5 : 1) in both modes.
- Headings and the "Eesti Ilm" wordmark use Nunito ExtraBold (800), self-hosted from `public/fonts/` with its OFL licence next to it. It is the only web font; body text uses the system font. Never load fonts or other files from a third party.
- Shared base styles (headings, text, links, lists, the `.container` width and the `.prose` column for long text) are in `src/styles/global.css`; page-specific layouts live with their pages.
- Icons and the share image are static files in `public/`, generated once from the design book's icon assets: `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og-image.png` and the header icons in `public/images/`.

## Localization

- English (`en`, default) and Estonian (`et`) only, matching the app. Do not add other languages.
- Estonian is translated in Crowdin, like the app. Crowdin syncs `master` through its GitHub integration, using `crowdin.yml`, and opens PRs titled "Update translations from Crowdin" from its service branch. English source text lives in files listed in `crowdin.yml` (today `src/i18n/en.json`), never hard-coded in templates.
- Never write or edit Estonian files by hand: they come from Crowdin PRs. Add new English text to a source file in `crowdin.yml`, and add new source files to `crowdin.yml` in the same PR.
- UI strings: read them with `useTranslations(locale)` from `src/i18n`. Crowdin exports untranslated or unapproved strings as empty strings; the helper treats empty and missing Estonian strings as untranslated and shows English instead. `npm test` covers this.
- Page text (privacy policy, support, landing): one Markdown file per page and locale, `src/content/pages/en/<page>.md`, with the Estonian file at `src/content/pages/et/<page>.md`. The first page ticket adds this entry to `crowdin.yml`:

  ```yaml
  - source: /src/content/pages/en/*.md
    translation: /src/content/pages/%two_letters_code%/%original_file_name%
    skip_untranslated_files: true
  ```

  Crowdin can't skip untranslated strings in Markdown, so `skip_untranslated_files` exports an Estonian page only once it is fully translated. Until then the Estonian URL shows the English text, never a half-translated page.

## Hosting and deploy

- Hostinger web hosting (shared plan). The domain `eestiilm.app` is registered at Hostinger.
- `.app` domains are HTTPS-only (HSTS preloaded): the site works only once the SSL certificate is active.
- Deploys run from GitHub Actions on push to `master` (`.github/workflows/deploy.yml`): check, test and build with Astro, then rsync `dist/` over SSH to the server. SSH details are GitHub secrets (`SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS`, `SSH_HOST`, `SSH_PORT`, `SSH_USER`, `SSH_TARGET_DIR`), never in the repo.
- Do not delete `.well-known/` on the server: it holds SSL validation files. The rsync step excludes it.

## Content rules

- The site must not suggest it is official or affiliated with the Estonian Environment Agency (Keskkonnaagentuur) or ilmateenistus.ee. Credit them as the data source.
- Never mention the owner's Apple Developer account, membership or its status.

## Ticket workflow

- Tickets are in Linear, team EES, project "Website 1.0", reached through the Orca CLI (`orca linear ... --workspace <id>`).
- Same Orca workflow as the app repo: the coordinator works on `master` and starts one worker per ticket in its own Orca worktree, on the ticket's git branch name.
- Local preview for visible changes: when a ticket changes what the site shows or how it looks, the worker starts a local preview in its worktree before reporting, with `npm run dev -- --host --background`. With `--background` the command returns while the server keeps running (without it, Astro only does this when it detects an agent). Astro prints a local URL and a Network URL for testing on a phone on the same Wi-Fi. It picks another port when 4321 is taken, so always use the printed URLs. The worker puts both URLs in its report, and the coordinator gives them to the owner with the PR link. The URLs stay out of the PR description, because they only work on the owner's machine.
- When the PR is merged or closed, the coordinator stops that preview with `npx astro dev stop` in the ticket's worktree, then releases the worker and removes the worktree.

## Git workflow

- `master` is protected: changes land through a PR with one approval, squash merges only.
- One branch per Linear ticket, named with the ticket's git branch name.
- Coding agents commit, push, open PRs and comment as the `telbin-bot` machine account. They never approve or directly merge PRs.
- Open PRs against `master` ready for review (no `--draft`). Fix CI failures and review findings with follow-up commits on the same PR.
- Rebase on `origin/master` and push with `--force-with-lease`; never merge `master` into a branch.
- Never push to `master`. Never create or push tags.

## Conventions

- No new dependencies without the owner's approval.
- Keep changes scoped to the ticket. No drive-by refactoring.
- Never commit secrets or personal data (SSH keys, hostnames from secrets, private emails, phone numbers).
