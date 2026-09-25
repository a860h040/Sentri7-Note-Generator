# Deploy the Sentri7 Note Generator

This project does **not** need GitHub Pages or Static HTML.

Use GitHub for the source code/rules and Google Apps Script only as the secure live web-app host.

## 1. Create a Google Apps Script project

Go to Google Apps Script and create a new standalone project.

## 2. Add the project files

Copy these files from this repository into the Apps Script project:

- `Code.gs`
- `Index.html`

Then open **Project Settings** and enable **Show "appsscript.json" manifest file in editor** if needed. Replace the manifest with this repository's `appsscript.json`.

## 3. Add the Gemini API key

In Apps Script:

**Project Settings → Script properties → Add script property**

Add:

```
GEMINI_API_KEY = your Gemini API key
```

Optional:

```
GEMINI_MODEL = gemini-2.5-flash-lite
```

Do not place the API key in GitHub or `Index.html`.

## 4. Deploy the live app

In Apps Script:

**Deploy → New deployment → Web app**

Recommended settings:

- Execute as: **Me**
- Who has access: **Anyone** (or the narrowest access option your organization requires)

Click **Deploy**.

Google will provide a Web app URL ending in `/exec`.

That `/exec` URL is the link you should bookmark and use for the Sentri7 Note Generator.

## 5. Future code updates

When `Code.gs` or `Index.html` changes in GitHub:

1. Copy the changed file into Apps Script.
2. Save.
3. Go to **Deploy → Manage deployments**.
4. Edit the deployment.
5. Choose **New version**.
6. Deploy.

Changes made only to `data/sentri7-rules.json` do not require redeploying the Apps Script app. The app loads the rules from GitHub automatically.

## Do not enable GitHub Pages

GitHub Pages would expose only the browser-side HTML. It cannot safely protect the Gemini API key by itself, and the current app uses server-side Apps Script functions.

The recommended production link is the Google Apps Script **Web app URL**, while GitHub remains the code and rule-storage location.
