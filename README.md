# Sentri7 Note Generator

A compact Sentri7 documentation generator based on the supplied Sentri7 Clinical Guidance Excel workbook.

## Live app

https://a860h040.github.io/Sentri7-Note-Generator/

## Current setup

- GitHub Pages provides the easy-to-use public link.
- The live Sentri7 app itself runs from this Google Apps Script deployment:
  https://script.google.com/macros/s/AKfycbzFHzycCuJlcSDkzyBimPLzoDEY3mG6SVzecQuF3dfddcHG1P-SDZLhrfIdS1ZHuqKl/exec
- No Google Sheet is used.
- The Gemini API key remains stored in Apps Script Script Properties, not in GitHub.

## Workflow

1. Search for a medication or Sentri7 note.
2. Select the exact Sentri7 rule.
3. Select Intervene, Review Never, or Review for Follow Up when available.
4. Complete the compact required fields from the Excel template.
5. Gemini corrects grammar, spelling, punctuation, and formatting while following the selected Excel example.
6. Missing required information remains visible as `[]`.
7. Copy the final Sentri7 comment.

## Sentri7 rule library

The Excel-derived rule library is stored in:

`data/sentri7-rules.json`

## Security

This repository is public. Never commit API keys, patient information, passwords, or generated notes to GitHub.

Only use patient-identifiable information if your organization has approved sending it to the configured Gemini API.

Clinical output should be reviewed by the pharmacist before use.
