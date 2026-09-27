# Sentri7 Note Generator

A GitHub Pages app for pharmacist Sentri7 documentation and grammar correction.

## Live app

https://a860h040.github.io/Sentri7-Note-Generator/

## Architecture

This version runs entirely on **GitHub Pages**.

- `index.html` — complete app UI and logic
- `data/sentri7-rules.json` — Excel-derived Sentri7 rules, required fields, and examples
- `.github/workflows/static.yml` — GitHub Pages deployment workflow

There is **no Google Apps Script** and **no Google Sheet**.

## Gemini

The app calls the Gemini API directly from the browser.

On first use, open **Gemini API Key** in the sidebar and paste your API key. The key is stored only in that browser's local storage and is not written to this GitHub repository.

## Sentri7 Note

1. Search for a medication or Sentri7 rule.
2. Select the exact rule.
3. Select Intervene, Review Never, or Review for Follow Up when available.
4. Enter only the fields required by that selected pathway.
5. Generate the comment.
6. Blank required fields remain visible as `[]`.

## Grammar Correction

Use the **Grammar Correction** sidebar item to paste a sentence or paragraph. Gemini corrects grammar, spelling, punctuation, capitalization, spacing, and readability while preserving the original meaning.

## Security

This repository is public. Never commit API keys, passwords, patient information, or generated patient notes.

The browser-stored Gemini API key can be removed at any time from **Gemini API Key** in the sidebar.

Only use patient-identifiable information if your organization has approved sending it to the Gemini API.

Clinical output should always be reviewed by the pharmacist before use.
