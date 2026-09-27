# GitHub Pages Deployment

The Sentri7 Note Generator now runs entirely from GitHub Pages.

## Live URL

https://a860h040.github.io/Sentri7-Note-Generator/

## Deployment

GitHub Actions automatically deploys the repository whenever `main` changes.

Workflow:

`.github/workflows/static.yml`

No Google Apps Script deployment is required.

## Gemini API key

The API key is intentionally **not stored in GitHub**.

Open the live app, choose **Gemini API Key** from the sidebar, and paste the key once. It is stored only in that browser's local storage.

If you change browsers or clear site data, enter the key again.

## Rules

Sentri7 rules are loaded directly from:

`data/sentri7-rules.json`

Changes to that file are deployed automatically through GitHub Pages.
