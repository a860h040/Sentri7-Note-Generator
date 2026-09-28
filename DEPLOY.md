# Sentri7 Note Generator Deployment

## Live URL

Use this as the normal app link:

`https://a860h040.github.io/Sentri7-Note-Generator/`

GitHub Pages opens the current Google Apps Script web app directly.

## Current Apps Script backend

`https://script.google.com/macros/s/AKfycbyV4h_fRinCEiODAQV7pem0Sfvfdv40hpKabl6SEcTI90h0tWzd2mz0bvJx5UDShy9m/exec`

No Google Sheet is used.

## Gemini API key

Keep the Gemini API key only in:

**Apps Script → Project Settings → Script properties**

Property:

`GEMINI_API_KEY`

Do not commit the key to GitHub.

## If the Apps Script deployment URL changes

Update the iframe `src` in GitHub's lowercase `index.html` to the new `/exec` URL. GitHub Pages will redeploy automatically.
