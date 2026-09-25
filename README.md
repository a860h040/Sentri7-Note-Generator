# Sentri7 Note Generator

A compact Google Apps Script web app for generating Sentri7 documentation comments from the clinical guidance templates used in this project.

## Current build

The repository includes the current compact app build as `Sentri7_Compact_Note_Generator.zip`.

The app workflow is:
1. Search/select the medication or Sentri7 rule.
2. Choose the applicable documentation pathway.
3. Enter the required template fields.
4. Generate the final Sentri7 comment.
5. Gemini is used to clean grammar, spelling, and formatting while following the selected Excel-derived template and preserving missing information as `[]`.

## Google Apps Script setup

1. Create a Google Apps Script project.
2. Add the included `Code.gs` and `Index.html` files from the ZIP.
3. In **Project Settings → Script properties**, add:
   - `GEMINI_API_KEY` = your Gemini API key
   - `GEMINI_MODEL` = optional model override
4. Deploy as a **Web app**.

## Security

Do **not** commit a Gemini API key to this repository. Keep the key in Google Apps Script Script Properties.

> Clinical note output should be reviewed by the pharmacist before use.