# AGENTS.md

## Overview

The website for Eesti Ilm, an iOS weather app for Estonia, at [eestiilm.app](https://eestiilm.app). It introduces the app and hosts the pages App Store Connect requires: a privacy policy and a support page. The app itself lives in a separate repo, [Shiaulis/Eesti-Ilm](https://github.com/Shiaulis/Eesti-Ilm).

The site is not scaffolded yet. This file describes the agreed setup; update it in the same PR that changes the setup.

## Communication

The owner is an iOS developer, not primarily a web developer. On every web change (Astro, HTML, CSS, SEO, CI), include a very brief explanation of why the change is needed and what practical difference it makes.

## Stack

- [Astro](https://astro.build), static output only (no server rendering). No client-side JavaScript unless a feature needs it.
- Node.js 24 in CI.
- The deploy setup follows the owner's other Astro site, [Shiaulis/Website-telbin.dev](https://github.com/Shiaulis/Website-telbin.dev): reuse its patterns (workflows, `.htaccess`, SHA-pinned actions) instead of inventing new ones.

## Pages

Planned for the first version:

- Landing page: what the app does, screenshots, App Store link (once the app is back on the App Store).
- Privacy policy: the App Store Connect Privacy Policy URL.
- Support: contact and FAQ, the App Store Connect Support URL.

Do not rename or move the privacy and support pages after they are live: their URLs are stored in App Store Connect and in the app repo's `fastlane/metadata/`.

## Localization

- English (`en`, default) and Estonian (`et`) only, matching the app. Do not add other languages.
- Estonian is translated in Crowdin, like the app. Crowdin syncs `master` through its GitHub integration, using `crowdin.yml`, and opens PRs titled "Update translations from Crowdin" from its service branch. English source text lives in files listed in `crowdin.yml` (today `src/i18n/en.json`), never hard-coded in templates.
- Never write or edit Estonian files by hand: they come from Crowdin PRs. Add new English text to a source file in `crowdin.yml`, and add new source files to `crowdin.yml` in the same PR.

## Hosting and deploy

- Hostinger web hosting (shared plan). The domain `eestiilm.app` is registered at Hostinger.
- `.app` domains are HTTPS-only (HSTS preloaded): the site works only once the SSL certificate is active.
- Deploys run from GitHub Actions on push to `master`: build with Astro, then rsync `dist/` over SSH to the server. SSH details are GitHub secrets, never in the repo.
- Do not delete `.well-known/` on the server: it holds SSL validation files.

## Content rules

- The site must not suggest it is official or affiliated with the Estonian Environment Agency (Keskkonnaagentuur) or ilmateenistus.ee. Credit them as the data source.
- Never mention the owner's Apple Developer account, membership or its status.

## Ticket workflow

- Tickets are in Linear, team EES, project "Website", reached through the Orca CLI (`orca linear ... --workspace <id>`).
- Same Orca workflow as the app repo: the coordinator works on `master` and starts one worker per ticket in its own Orca worktree, on the ticket's git branch name.

## Git workflow

- One branch per Linear ticket, named with the ticket's git branch name.
- Coding agents commit, push, open PRs and comment as the `telbin-bot` machine account. They never approve or directly merge PRs.
- Open PRs against `master` ready for review (no `--draft`). Fix CI failures and review findings with follow-up commits on the same PR.
- Rebase on `origin/master` and push with `--force-with-lease`; never merge `master` into a branch.
- Never push to `master`. Never create or push tags.

## Conventions

- No new dependencies without the owner's approval.
- Keep changes scoped to the ticket. No drive-by refactoring.
- Never commit secrets or personal data (SSH keys, hostnames from secrets, private emails, phone numbers).
