# Sentri7 Note Generator

A compact Sentri7 documentation generator built from the supplied Sentri7 Clinical Guidance Excel workbook.

## Live app

https://a860h040.github.io/Sentri7-Note-Generator/

## How it works

- Search for a medication or Sentri7 note.
- Select the exact Sentri7 rule.
- Select Intervene, Review Never, or Review for Follow Up when available.
- Complete only the required fields from the Excel template.
- Gemini corrects spelling, grammar, punctuation, and formatting while following the selected Excel example.
- Missing required information stays visible as `[]`.
- Copy the final Sentri7 comment.

## Architecture

This version runs directly on **GitHub Pages**.

- `index.html` — complete browser app
- `data/sentri7-rules.json` — 89 Excel-derived Sentri7 rules, required fields, and examples

There is **no Google Sheet** and **no Google Apps Script runtime**.

On first use, the app asks for a Gemini API key. The key is stored only in that browser's local storage and is not committed to GitHub.

## Updating Sentri7 guidance

Edit:

`data/sentri7-rules.json`

GitHub Pages automatically serves the updated rule library after the repository deploys.

## Security

This repository is public. Never commit API keys, patient information, generated patient notes, or passwords.

The browser-saved API key can be removed using the **API Key** button in the live app.

Only use patient-identifiable information if your organization has approved sending it to the Gemini API.

Clinical output should be reviewed by the pharmacist before use.
