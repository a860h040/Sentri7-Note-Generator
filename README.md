# Sentri7 Note Generator

A compact Sentri7 documentation generator built from the supplied Sentri7 Clinical Guidance Excel workbook.

## Recommended setup

The easiest and safest setup is:

- **GitHub** = stores the app code and Sentri7 rule library.
- **Google Apps Script Web App** = hosts the live app and securely stores the Gemini API key.
- **No Google Sheet is used.**
- **GitHub Pages / Static HTML is not needed.**

This avoids exposing the Gemini API key in a public webpage while keeping the rule library and source code in GitHub.

## Repository structure

- `Index.html` — compact user interface
- `Code.gs` — server-side Apps Script logic and Gemini call
- `data/sentri7-rules.json` — 89 Excel-derived Sentri7 rules, required fields, and examples
- `appsscript.json` — Apps Script manifest
- `DEPLOY.md` — simple deployment instructions

## Workflow

1. Search for a medication or Sentri7 note.
2. Select the exact Sentri7 rule.
3. Select Intervene, Review Never, or Review for Follow Up when available.
4. Complete the compact required fields from the Excel template.
5. Gemini corrects spelling, grammar, punctuation, and formatting while following the selected Excel example.
6. Missing required information stays visible as `[]`.
7. Copy the final Sentri7 comment.

## Data handling

- Google Sheets are not used.
- Patient-entered fields and generated notes are not saved by the application.
- The Sentri7 rule library is loaded from GitHub.
- The Gemini API key stays in Google Apps Script Script Properties and is not committed to GitHub.

## Updating Sentri7 guidance

Edit `data/sentri7-rules.json` in GitHub. The deployed app reads that file directly from the repository. A short temporary cache is used for performance, but GitHub remains the source of truth.

## Security

This repository is public. Never commit patient information, generated patient notes, passwords, or API keys.

Clinical output should be reviewed by the pharmacist before use.
