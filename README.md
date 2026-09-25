# Sentri7 Note Generator

Compact Sentri7 documentation generator built from the supplied Sentri7 Clinical Guidance Excel workbook.

## Architecture

GitHub is now the source of truth for the application and Sentri7 rule library.

- `Index.html` — compact user interface
- `Code.gs` — server-side Apps Script logic and Gemini call
- `data/sentri7-rules.json` — the 89 Excel-derived Sentri7 rules, required fields, and example templates
- `appsscript.json` — Apps Script manifest

**Google Sheets is not used.**

The app loads the Sentri7 rule library directly from this GitHub repository. Generated patient notes are returned to the browser and are not saved by the application.

## Workflow

1. Search for a medication or Sentri7 note.
2. Select the exact Sentri7 rule.
3. Select Intervene, Review Never, or Review for Follow Up when available.
4. Complete the compact required fields from the Excel template.
5. Gemini corrects spelling, grammar, punctuation, and formatting while following the selected Excel example.
6. Missing required information stays visible as `[]`.
7. Copy the final Sentri7 comment.

## Google Apps Script deployment

Apps Script is used only as the secure server-side runtime for the Gemini API key and to serve the web app. It does not use a Google Sheet.

1. Create a Google Apps Script project.
2. Copy `Code.gs`, `Index.html`, and `appsscript.json` from this repository.
3. In **Project Settings → Script properties**, add:
   - `GEMINI_API_KEY` = your Gemini API key
   - `GEMINI_MODEL` = optional; defaults to `gemini-2.5-flash-lite`
4. Deploy as a **Web app**.

## Updating Sentri7 guidance

Edit `data/sentri7-rules.json` in GitHub. The deployed app reads its rule library from:

`https://raw.githubusercontent.com/a860h040/Sentri7-Note-Generator/main/data/sentri7-rules.json`

The server temporarily caches rules for performance, but GitHub remains the source of truth.

## Security and patient information

This repository is public. **Never commit patient information, generated patient notes, passwords, or API keys to GitHub.**

The Gemini API key must remain in Apps Script Script Properties. The application code does not persist the clinical fields or final comment.

Clinical output should be reviewed by the pharmacist before use.
