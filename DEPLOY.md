# Deploy the Sentri7 Note Generator

## Recommended setup

The project now uses:

- **GitHub** for the source code and the 89-rule Sentri7 library.
- **GitHub Pages** as the easy-to-remember launcher URL.
- **Google Apps Script** only as the secure backend/web app that stores the Gemini API key.
- **No Google Sheet.**

Your GitHub Pages address is:

`https://a860h040.github.io/Sentri7-Note-Generator/`

## First-time setup

### 1. Deploy the Apps Script web app

Create or open the Apps Script project containing:

- `Code.gs`
- `Index.html`
- `appsscript.json`

In **Project Settings → Script properties**, add:

```
GEMINI_API_KEY = your Gemini API key
```

Optional:

```
GEMINI_MODEL = gemini-2.5-flash-lite
```

Then use:

**Deploy → New deployment → Web app**

Recommended:

- Execute as: **Me**
- Who has access: **Anyone** or the narrowest option that works for your environment

Copy the Web App URL ending in `/exec`.

### 2. Open the GitHub Pages link

Open:

`https://a860h040.github.io/Sentri7-Note-Generator/`

The first time, paste the Apps Script `/exec` URL into the connection box and click **Open App**.

The browser saves that URL locally. On later visits, the GitHub Pages address opens the Sentri7 app automatically.

Use **Change app URL** in the lower-right corner if the Apps Script deployment URL ever changes.

## Why this setup

The GitHub Pages address is easy to remember, while the Gemini API key remains server-side in Apps Script. The key is never committed to the public GitHub repository.

## Sentri7 rule updates

Edit:

`data/sentri7-rules.json`

The Apps Script backend reads this rule library from GitHub. Changes to rule data do not require a Google Sheet.

## Security

Do not commit:

- Gemini API keys
- patient information
- generated patient notes
- passwords

The application does not intentionally persist patient-entered fields or generated notes.
