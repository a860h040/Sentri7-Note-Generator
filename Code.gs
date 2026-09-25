/**
 * Sentri7 Note Generator - Google Apps Script backend
 * Rules source: GitHub data/sentri7-rules.json
 *
 * Script Properties:
 *   GEMINI_API_KEY = required
 *   GEMINI_MODEL   = optional; default gemini-2.5-flash
 */
const SENTRI7_RULES_URL =
  'https://raw.githubusercontent.com/a860h040/Sentri7-Note-Generator/main/data/sentri7-rules.json';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Sentri7 Note Generator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getRuleCatalog() {
  return getRules_().map(function(rule) {
    return {
      id: rule.id,
      title: rule.title,
      section: rule.section,
      searchText: rule.searchText || '',
      types: Object.keys(rule.paths || {}).filter(function(type) {
        return rule.paths[type] && rule.paths[type].available;
      })
    };
  });
}

function getRuleForm(ruleId, noteType) {
  const rule = findRule_(ruleId);
  if (!rule) throw new Error('Sentri7 rule not found.');

  const availableTypes = Object.keys(rule.paths || {}).filter(function(type) {
    return rule.paths[type] && rule.paths[type].available;
  });

  const selectedType =
    noteType && rule.paths[noteType] && rule.paths[noteType].available
      ? noteType
      : (availableTypes[0] || '');

  const path = selectedType ? rule.paths[selectedType] : null;

  return {
    ruleId: rule.id,
    title: rule.title,
    section: rule.section,
    availableTypes: availableTypes,
    selectedType: selectedType,
    fields: path
      ? (path.requirements || []).map(function(label, index) {
          return { id: 'f' + (index + 1), label: label, required: true };
        })
      : []
  };
}

function generateSentri7Comment(payload) {
  if (!payload || !payload.ruleId || !payload.noteType) {
    throw new Error('Select a Sentri7 rule and note type first.');
  }

  const rule = findRule_(payload.ruleId);
  if (!rule) throw new Error('Sentri7 rule not found.');

  const path = (rule.paths || {})[payload.noteType];
  if (!path || !path.available) {
    throw new Error('The selected note type is not available for this rule.');
  }

  const submitted = Array.isArray(payload.fields) ? payload.fields : [];
  const required = path.requirements || [];

  const values = required.map(function(label, index) {
    let match = submitted.find(function(item) {
      return item && String(item.label || '').trim() === String(label).trim();
    });

    if (!match && submitted[index]) match = submitted[index];

    let value = match && match.value != null
      ? String(match.value).trim()
      : '';

    if (!value) value = '[]';

    return { label: label, value: value };
  });

  const examples = (path.examples || [])
    .filter(function(item) {
      return item && item.text && !isNA_(item.text);
    })
    .map(function(item) {
      return (item.label || 'Example') + ':\n' + item.text;
    })
    .join('\n\n');

  const patientData = values
    .map(function(item) {
      return '- ' + item.label + ': ' + item.value;
    })
    .join('\n');

  const prompt = [
    'You are formatting a Sentri7 pharmacist documentation comment.',
    '',
    'MANDATORY RULES:',
    '1. Use the selected Sentri7 Excel-derived rule below as the source of truth.',
    '2. Use the EXCEL EXAMPLE as the primary template for sentence order, phrasing, abbreviations, and formatting.',
    '3. Never copy sample-patient facts from the example unless they also appear in USER-ENTERED DATA.',
    '4. Use every required field from USER-ENTERED DATA.',
    '5. If a field value is [], keep [] visibly in the final comment where that information naturally belongs.',
    '6. Never invent or infer missing clinical facts.',
    '7. Correct grammar, spelling, capitalization, punctuation, and spacing.',
    '8. Preserve all clinical facts, numbers, doses, units, routes, frequencies, dates, organisms, and provider names exactly in meaning.',
    '9. Do not add new clinical recommendations that were not entered by the user.',
    '10. Output ONLY the final Sentri7 comment.',
    '',
    'RULE:', rule.title,
    '',
    'CLINICAL AREA:', rule.section,
    '',
    'DOCUMENTATION TYPE:', payload.noteType,
    '',
    'RULE PURPOSE:', rule.purpose || '',
    '',
    'RULE ACTION:', rule.action || '',
    '',
    'WHEN THIS PATH IS USED:', path.when || '',
    '',
    'REQUIRED DOCUMENTATION:', path.what || '',
    '',
    'EXCEL EXAMPLE TEMPLATE(S):', examples || 'No example provided',
    '',
    'USER-ENTERED DATA:', patientData || '[]',
    '',
    'Produce the final Sentri7 comment now.'
  ].join('\n');

  let comment = callGemini_(prompt).trim();
  if (!comment) throw new Error('Gemini returned an empty comment.');

  comment = comment
    .replace(/^\`\`\`(?:text)?\s*/i, '')
    .replace(/\s*\`\`\`$/i, '')
    .trim();

  return { comment: comment };
}

function getRules_() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'sentri7_rules_v3';
  const cached = cache.get(cacheKey);

  if (cached) {
    try {
      const rules = JSON.parse(cached);
      if (Array.isArray(rules) && rules.length) return rules;
    } catch (e) {}
  }

  const response = UrlFetchApp.fetch(SENTRI7_RULES_URL, {
    method: 'get',
    muteHttpExceptions: true
  });

  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300) {
    throw new Error('Could not load Sentri7 rules from GitHub.');
  }

  const rules = JSON.parse(response.getContentText());

  try {
    cache.put(cacheKey, JSON.stringify(rules), 300);
  } catch (e) {}

  return rules;
}

function findRule_(ruleId) {
  return getRules_().find(function(rule) {
    return rule.id === ruleId;
  }) || null;
}

function isNA_(value) {
  if (value == null) return true;
  const x = String(value).trim().toUpperCase();
  return !x || x === 'NA' || x === 'N/A';
}

function callGemini_(prompt) {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from Apps Script > Project Settings > Script properties.');
  }

  const configuredModel =
    props.getProperty('GEMINI_MODEL') || 'gemini-2.5-flash';

  const models = unique_([
    configuredModel,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite'
  ]);

  const body = {
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048
    }
  };

  let lastError = '';

  for (let modelIndex = 0; modelIndex < models.length; modelIndex++) {
    const model = models[modelIndex];
    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      encodeURIComponent(model) +
      ':generateContent?key=' +
      encodeURIComponent(apiKey);

    for (let attempt = 0; attempt < 4; attempt++) {
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(body),
        muteHttpExceptions: true
      });

      const status = response.getResponseCode();
      const text = response.getContentText();

      if (status >= 200 && status < 300) {
        const parsed = JSON.parse(text);
        const candidates = parsed.candidates || [];
        const parts = ((((candidates[0] || {}).content || {}).parts) || []);
        const output = parts.map(function(part) {
          return part.text || '';
        }).join('').trim();

        if (output) return output;

        lastError = 'Gemini returned no usable text.';
        break;
      }

      lastError = 'Gemini API ' + status + ': ' + text.substring(0, 800);

      const retryable =
        status === 408 ||
        status === 429 ||
        (status >= 500 && status <= 599);

      if (!retryable) throw new Error(lastError);

      if (attempt < 3) {
        Utilities.sleep(
          Math.pow(2, attempt) * 1000 +
          Math.floor(Math.random() * 500)
        );
      }
    }
  }

  throw new Error('Gemini is temporarily unavailable. ' + lastError);
}

function unique_(values) {
  return values.filter(function(value, index, self) {
    return value && self.indexOf(value) === index;
  });
}
