# Sentri7 Note Generator

The app now runs directly from GitHub Pages.

Live app:

`https://a860h040.github.io/Sentri7-Note-Generator/`

## First use

1. Open the live app.
2. Paste your Gemini API key when prompted.
3. The key is stored only in that browser's local storage.
4. Search for a medication or Sentri7 rule, choose the note type, complete the required fields, and generate the final comment.

## No Google Apps Script or Google Sheet

This version does not use Google Apps Script and does not use Google Sheets.

The Sentri7 rule library is stored in:

`data/sentri7-rules.json`

The page calls the Gemini API directly from the browser.

## Security

The repository is public. Never commit API keys, patient information, or generated notes.

The saved Gemini key remains in the browser and can be removed with the **API Key** button in the lower-right corner.

Only use patient-identifiable information if your organization has approved sending it to the Gemini API.
