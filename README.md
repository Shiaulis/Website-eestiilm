# eestiilm.app

The website for [Eesti Ilm](https://github.com/Shiaulis/Eesti-Ilm), an iOS weather app for Estonia that shows the forecast from the Estonian Environment Agency.

The site is built with [Astro](https://astro.build), available in English and Estonian, and deployed to [eestiilm.app](https://eestiilm.app) by GitHub Actions.

## Development

Needs Node.js 24 or newer.

```sh
npm install
npm run dev      # local server at http://localhost:4321
npm run check    # type check
npm test         # unit tests
npm run build    # static site in dist/
```

English text lives in `src/i18n/en.json` (UI strings) and `src/content/pages/en/` (page text in Markdown). Estonian is translated in Crowdin and arrives as pull requests. See [AGENTS.md](AGENTS.md) for the project's setup and rules.

## Deploy

Every push to `master` builds the site and uploads `dist/` to Hostinger with rsync over SSH (`.github/workflows/deploy.yml`). The SSH details are GitHub secrets.
