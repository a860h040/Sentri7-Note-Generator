/**
 * Sentri7 Note Generator
 *
 * Source of truth:
 *   GitHub: data/sentri7-rules.json
 *
 * No Google Sheet is used or required.
 * Patient-entered data and generated comments are not persisted by this code.
 *
 * Script Properties:
 *   GEMINI_API_KEY = required
 *   GEMINI_MODEL   = optional; default gemini-2.5-flash-lite
 */

const SENTRI7_RULES_URL =
  'https://raw.githubusercontent.com/a860h040/Sentri7-Note-Generator/main/data/sentri7-rules.json';

const SENTRI7_RULES_CACHE_KEY = 'sentri7_rules_v1';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Sentri7 Note Generator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getRuleCatalog() {
  const rules = getRules_();

  return rules.map(function(rule) {
    return {
      id: rule.id,
      title: rule.title,
      section: rule.section,
      searchText: rule.searchText || buildSearchText_(rule),
      types: Object.keys(rule.paths || {}).filter(function(key) {
        return rule.paths[key] && rule.paths[key].available;
      })
    };
  });
}

function getRuleForm(ruleId, noteType) {
  const rule = findRule_(ruleId);
  if (!rule) throw new Error('Sentri7 rule not found.');

  const availableTypes = Object.keys(rule.paths || {}).filter(function(key) {
    return rule.paths[key] && rule.paths[key].available;
  });

  const type =
    noteType &&
    rule.paths[noteType] &&
    rule.paths[noteType].available
      ? noteType
      : (availableTypes[0] || '');

  if (!type) {
    return {
      ruleId: rule.id,
      title: rule.title,
      section: rule.section,
      availableTypes: [],
      selectedType: '',
      fields: [],
      noTemplate: true
    };
  }

  const path = rule.paths[type];

  return {
    ruleId: rule.id,
    title: rule.title,
    section: rule.section,
    availableTypes: availableTypes,
    selectedType: type,
    fields: (path.requirements || []).map(function(label, index) {
      return {
        id: 'f' + (index + 1),
        label: label,
        required: true
      };
    }),
    noTemplate: false
  };
}

function generateSentri7Comment(payload) {
  if (!payload || !payload.ruleId || !payload.noteType) {
    throw new Error('Select a Sentri7 note and documentation type first.');
  }

  const rule = findRule_(payload.ruleId);
  if (!rule) throw new Error('Sentri7 rule not found.');

  const path = (rule.paths || {})[payload.noteType];
  if (!path || !path.available) {
    throw new Error(
      'The selected documentation type is not defined in the Sentri7 guideline for this rule.'
    );
  }

  const required = path.requirements || [];
  const submitted = Array.isArray(payload.fields) ? payload.fields : [];

  const values = required.map(function(label, index) {
    let match = submitted.find(function(item) {
      return (
        item &&
        String(item.label || '').trim() === String(label).trim()
      );
    });

    if (!match && submitted[index]) match = submitted[index];

    let value =
      match && match.value != null
        ? String(match.value).trim()
        : '';

    if (!value) value = '[]';

    return {
      label: label,
      value: value
    };
  });

  const examples = (path.examples || [])
    .filter(function(item) {
      return item && item.text && !isNA_(item.text);
    })
    .map(function(item) {
      return (item.label || 'Example') + ':\n' + item.text;
    })
    .join('\n\n');

  const fieldBlock = values
    .map(function(item) {
      return '- ' + item.label + ': ' + item.value;
    })
    .join('\n');

  const prompt = [
    'You are formatting a Sentri7 pharmacist documentation comment.',
    '',
    'MANDATORY RULES:',
    '1. The Sentri7 guideline below is the ONLY source of truth.',
    '2. The EXCEL EXAMPLE is the primary template for sentence order, phrasing style, abbreviations, and formatting.',
    '3. The example contains sample-patient facts. NEVER copy a medication, dose, lab value, diagnosis, organism, provider, outcome, date, or other patient fact from the example unless that same fact appears in USER-ENTERED DATA.',
    '4. Use every required field listed in USER-ENTERED DATA.',
    '5. If a required field has the value [], keep [] visibly in the final comment where that information naturally belongs.',
    '6. Never invent or infer missing clinical facts and never fill [] using general medical knowledge.',
    '7. Correct spelling, grammar, capitalization, punctuation, spacing, and formatting in user-entered text.',
    '8. Correct an obvious medication-name typo only when the intended medication is unambiguous from the selected rule and user entry.',
    '9. Preserve all patient-specific numbers, doses, units, routes, frequencies, lab values, organisms, dates, and provider names exactly in meaning. Normalize spacing/capitalization only.',
    '10. If the Excel example is multiline or uses headings, preserve that general structure.',
    '11. Do not add Assessment, Plan, warnings, explanations, or clinical advice unless the Excel example uses them.',
    '12. Output ONLY the final Sentri7 comment. No quotation marks, no preface, no explanation.',
    '',
    'SELECTED SENTRI7 RULE:',
    rule.title,
    '',
    'CLINICAL AREA:',
    rule.section,
    '',
    'DOCUMENTATION TYPE:',
    payload.noteType,
    '',
    'RULE PURPOSE:',
    rule.purpose || 'Not provided in Excel',
    '',
    'RULE ACTION:',
    rule.action || 'Not provided in Excel',
    '',
    'WHEN THIS PATH IS USED:',
    path.when || 'Not provided in Excel',
    '',
    'REQUIRED DOCUMENTATION FROM EXCEL ("What"):',
    path.what || 'Not provided in Excel',
    '',
    'EXCEL EXAMPLE TEMPLATE(S):',
    examples || 'No example provided in Excel',
    '',
    'USER-ENTERED DATA:',
    fieldBlock || '- No required fields are defined in Excel for this pathway.',
    '',
    'Produce the final Sentri7 comment now.'
  ].join('\n');

  let comment = callGemini_(prompt).trim();

  if (!comment) {
    throw new Error('Gemini returned an empty comment.');
  }

  comment = comment
    .replace(/^\`\`\`(?:text)?\s*/i, '')
    .replace(/\s*\`\`\`$/i, '')
    .trim();

  return {
    comment: comment
  };
}

function getGeminiStatus() {
  const props = PropertiesService.getScriptProperties();
  const rules = getRules_();

  return {
    configured: !!props.getProperty('GEMINI_API_KEY'),
    model:
      props.getProperty('GEMINI_MODEL') ||
      'gemini-2.5-flash-lite',
    ruleCount: rules.length,
    rulesSource: 'GitHub'
  };
}

function getRules_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(SENTRI7_RULES_CACHE_KEY);

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    } catch (error) {
      // Ignore a bad cache entry and refresh from GitHub.
    }
  }

  const response = UrlFetchApp.fetch(SENTRI7_RULES_URL, {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      Accept: 'application/vnd.github.raw+json'
    }
  });

  const status = response.getResponseCode();
  const text = response.getContentText();

  if (status < 200 || status >= 300) {
    throw new Error(
      'Could not load Sentri7 rules from GitHub. HTTP ' +
      status +
      ': ' +
      text.substring(0, 500)
    );
  }

  let rules;

  try {
    rules = JSON.parse(text);
  } catch (error) {
    throw new Error(
      'Sentri7 rules on GitHub are not valid JSON.'
    );
  }

  if (!Array.isArray(rules) || !rules.length) {
    throw new Error(
      'No Sentri7 rules were found in the GitHub rule library.'
    );
  }

  // Temporary performance cache only. GitHub remains the source of truth.
  try {
    cache.put(
      SENTRI7_RULES_CACHE_KEY,
      JSON.stringify(rules),
      300
    );
  } catch (error) {
    // App still works if the temporary cache is too large.
  }

  return rules;
}

function findRule_(ruleId) {
  const rules = getRules_();

  return (
    rules.find(function(rule) {
      return rule.id === ruleId;
    }) || null
  );
}

function buildSearchText_(rule) {
  const parts = [
    rule.title,
    rule.section,
    rule.purpose,
    rule.action
  ];

  Object.keys(rule.paths || {}).forEach(function(key) {
    const path = rule.paths[key] || {};
    parts.push(key);
    parts.push(path.when);
    parts.push(path.what);

    (path.examples || []).forEach(function(example) {
      parts.push(example && example.text);
    });
  });

  return parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function isNA_(value) {
  if (value == null) return true;

  const text = String(value).trim().toUpperCase();

  return (
    !text ||
    text === 'NA' ||
    text === 'N/A'
  );
}

function callGemini_(prompt) {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is missing from Apps Script > Project Settings > Script properties.'
    );
  }

  const configured =
    props.getProperty('GEMINI_MODEL') ||
    'gemini-2.5-flash-lite';

  const models = unique_([
    configured,
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash'
  ]);

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
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
        let parsed;

        try {
          parsed = JSON.parse(text);
        } catch (error) {
          throw new Error(
            'Gemini returned invalid JSON from the API.'
          );
        }

        const candidates = parsed.candidates || [];

        if (!candidates.length) {
          lastError =
            'Gemini returned no candidate response.';
          break;
        }

        const parts =
          (((candidates[0] || {}).content || {}).parts || []);

        const output = parts
          .map(function(part) {
            return part.text || '';
          })
          .join('')
          .trim();

        if (output) {
          return output;
        }

        lastError = 'Gemini returned no usable text.';
        break;
      }

      lastError =
        'Gemini API ' +
        status +
        ': ' +
        text.substring(0, 800);

      const retryable =
        status === 408 ||
        status === 429 ||
        (status >= 500 && status <= 599);

      if (!retryable) {
        throw new Error(lastError);
      }

      if (attempt < 3) {
        Utilities.sleep(
          Math.pow(2, attempt) * 1000 +
          Math.floor(Math.random() * 500)
        );
      }
    }
  }

  throw new Error(
    'Gemini is temporarily unavailable. ' +
    lastError
  );
}

function unique_(values) {
  return values.filter(function(value, index, self) {
    return value && self.indexOf(value) === index;
  });
}
