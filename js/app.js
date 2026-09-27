(() => {
  'use strict';

  const $main = document.getElementById('main');
  const $title = document.getElementById('survey-title');
  const $subtitle = document.getElementById('survey-subtitle');

  const SCALE_LABELS = ['1', '2', '3', '4', '5'];

  const SEIZURE_OPTIONS = ["No", "Don't think so", "Maybe", "Probably", "Yes"];

  const ACTIVITIES = [
    { name: 'Work', key: 'work' },
    { name: 'Meeting', key: 'meeting' },
    { name: 'Phone call', key: 'phone_call' },
    { name: 'Social event', key: 'social_event' },
    { name: 'Exercise', key: 'exercise' },
  ];

  const SURVEYS = {
    morning: {
      title: 'Morning Check-in',
      subtitle: 'A quick question about last night',
      fields: [
        { type: 'scale', key: 'sleep', label: 'How was your sleep quality?', low: 'Poor', high: 'Great' },
      ],
    },
    afternoon: {
      title: 'Afternoon Check-in',
      subtitle: 'About this morning',
      about: 'morning',
      fields: afternoonEveningFields('morning'),
    },
    evening: {
      title: 'Evening Check-in',
      subtitle: 'About this afternoon',
      about: 'afternoon',
      fields: afternoonEveningFields('afternoon'),
    },
  };

  function afternoonEveningFields(periodWord) {
    return [
      { type: 'scale', key: 'mood', label: `How was your mood this ${periodWord}?`, low: 'Low', high: 'Great' },
      { type: 'scale', key: 'physical', label: `How did you feel physically this ${periodWord}?`, low: 'Poor', high: 'Great' },
      {
        type: 'choice',
        key: 'seizures_scale',
        label: 'Any seizure activity?',
        options: SEIZURE_OPTIONS,
        noteKey: 'seizures_note',
        notePlaceholder: 'Anything you want to add (optional)',
      },
      { type: 'activities', key: 'activities', label: `What did you do this ${periodWord}?`, hint: 'Select all that apply and how long' },
      { type: 'scale', key: 'difficulty', label: `How hard was this ${periodWord}?`, low: 'Easy', high: 'Very hard' },
      { type: 'text', key: 'free_text', label: 'Anything else to note?', placeholder: 'Optional' },
    ];
  }

  function getSurveyKeyFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const survey = (params.get('survey') || '').toLowerCase();
    return SURVEYS[survey] ? survey : null;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function render() {
    const surveyKey = getSurveyKeyFromUrl();
    if (!surveyKey) {
      renderPicker();
    } else {
      renderSurvey(surveyKey);
    }
  }

  function renderPicker() {
    $title.textContent = 'Daily Tracker';
    $subtitle.textContent = 'Choose a check-in';
    $main.innerHTML = '';

    const tpl = document.getElementById('tpl-picker');
    const node = tpl.content.cloneNode(true);
    node.querySelectorAll('.picker-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const survey = btn.getAttribute('data-survey');
        window.location.search = `?survey=${survey}`;
      });
    });
    $main.appendChild(node);
  }

  function renderSurvey(surveyKey) {
    const survey = SURVEYS[surveyKey];
    $title.textContent = survey.title;
    $subtitle.textContent = survey.subtitle;
    $main.innerHTML = '';

    const card = el('div', 'card');
    const answers = {};
    const fieldRefs = [];

    survey.fields.forEach((field) => {
      const { node, getValue } = buildField(field, answers);
      card.appendChild(node);
      fieldRefs.push({ field, getValue });
    });

    const errorMsg = el('p', 'error-msg');
    errorMsg.style.display = 'none';

    const submitBtn = el('button', 'submit-btn', 'Submit');
    submitBtn.addEventListener('click', async () => {
      errorMsg.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      const payload = buildPayload(surveyKey, fieldRefs);
      const ok = await submitPayload(payload);

      if (ok) {
        showDone();
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
        errorMsg.textContent = "Couldn't save right now — it will retry automatically. You can also close and try again later.";
        errorMsg.style.display = 'block';
      }
    });

    card.appendChild(errorMsg);
    card.appendChild(submitBtn);
    $main.appendChild(card);
  }

  function buildField(field, answers) {
    if (field.type === 'scale') return buildScaleField(field, answers);
    if (field.type === 'choice') return buildChoiceField(field, answers);
    if (field.type === 'activities') return buildActivitiesField(field, answers);
    if (field.type === 'text') return buildTextField(field, answers);
    throw new Error(`Unknown field type: ${field.type}`);
  }

  function buildScaleField(field, answers) {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', 'field-label', field.label));

    const row = el('div', 'scale-row');
    let selected = null;
    const buttons = SCALE_LABELS.map((num) => {
      const btn = el('button', 'scale-btn', num);
      btn.type = 'button';
      btn.addEventListener('click', () => {
        selected = Number(num);
        answers[field.key] = selected;
        buttons.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      row.appendChild(btn);
      return btn;
    });
    wrap.appendChild(row);

    const labels = el('div', 'scale-labels');
    labels.appendChild(el('span', null, field.low || ''));
    labels.appendChild(el('span', null, field.high || ''));
    wrap.appendChild(labels);

    return {
      node: wrap,
      getValue: () => selected,
    };
  }

  function buildChoiceField(field, answers) {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', 'field-label', field.label));

    const list = el('div', 'choice-list');
    let selected = null;
    const buttons = field.options.map((opt) => {
      const btn = el('button', 'choice-btn', opt);
      btn.type = 'button';
      btn.addEventListener('click', () => {
        selected = opt;
        buttons.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      list.appendChild(btn);
      return btn;
    });
    wrap.appendChild(list);

    let noteInput = null;
    if (field.noteKey) {
      noteInput = el('textarea');
      noteInput.placeholder = field.notePlaceholder || '';
      wrap.appendChild(noteInput);
    }

    return {
      node: wrap,
      getValue: () => ({ [field.key]: selected, [field.noteKey]: noteInput ? noteInput.value.trim() : '' }),
    };
  }

  function buildActivitiesField(field, answers) {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', 'field-label', field.label));
    if (field.hint) {
      const hint = el('span', 'field-hint', field.hint);
      wrap.querySelector('.field-label').appendChild(hint);
    }

    const state = {};

    ACTIVITIES.forEach(({ name, key }) => {
      const row = el('div', 'activity-row');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'activity-checkbox';

      const label = el('span', 'activity-name', name);

      const duration = document.createElement('input');
      duration.type = 'text';
      duration.className = 'activity-duration';
      duration.placeholder = 'Duration in hours';
      duration.disabled = true;

      checkbox.addEventListener('change', () => {
        duration.disabled = !checkbox.checked;
        row.classList.toggle('selected', checkbox.checked);
        if (checkbox.checked) {
          state[key] = duration.value.trim();
        } else {
          delete state[key];
          duration.value = '';
        }
      });

      duration.addEventListener('input', () => {
        if (checkbox.checked) state[key] = duration.value.trim();
      });

      row.appendChild(checkbox);
      row.appendChild(label);
      row.appendChild(duration);
      wrap.appendChild(row);
    });

    return {
      node: wrap,
      getValue: () => {
        const out = {};
        ACTIVITIES.forEach(({ key }) => {
          const checked = key in state;
          out[`${key}_done`] = checked ? 'Yes' : '';
          out[`${key}_duration`] = checked ? state[key] : '';
        });
        return out;
      },
    };
  }

  function buildTextField(field, answers) {
    const wrap = el('div', 'field');
    wrap.appendChild(el('label', 'field-label', field.label));

    const textarea = el('textarea');
    textarea.placeholder = field.placeholder || '';
    wrap.appendChild(textarea);

    return {
      node: wrap,
      getValue: () => textarea.value.trim(),
    };
  }

  function buildPayload(surveyKey, fieldRefs) {
    const now = new Date();
    const payload = {
      timestamp: now.toISOString(),
      time_of_day: surveyKey,
      sleep: '',
      mood: '',
      physical: '',
      seizures_scale: '',
      seizures_note: '',
      difficulty: '',
      free_text: '',
    };
    ACTIVITIES.forEach(({ key }) => {
      payload[`${key}_done`] = '';
      payload[`${key}_duration`] = '';
    });

    fieldRefs.forEach(({ field, getValue }) => {
      const value = getValue();
      if (field.type === 'scale') {
        payload[field.key] = value;
      } else if (field.type === 'choice') {
        Object.assign(payload, value);
      } else if (field.type === 'activities') {
        Object.assign(payload, value);
      } else if (field.type === 'text') {
        payload[field.key] = value;
      }
    });

    return payload;
  }

  function showDone() {
    $title.textContent = 'Daily Tracker';
    $subtitle.textContent = '';
    $main.innerHTML = '';
    const tpl = document.getElementById('tpl-done');
    const node = tpl.content.cloneNode(true);
    $main.appendChild(node);
    document.getElementById('done-close').addEventListener('click', () => {
      window.location.search = '';
    });
  }

  // ---- Submission + offline retry queue ----

  const QUEUE_KEY = 'tracker_pending_submissions';

  function readQueue() {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function writeQueue(queue) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      // ignore storage errors
    }
  }

  async function sendToSheet(payload) {
    const url = window.APP_CONFIG && window.APP_CONFIG.SHEET_WEBHOOK_URL;
    if (!url || url.includes('PASTE_YOUR_APPS_SCRIPT')) {
      console.warn('Sheet webhook URL is not configured yet.');
      return false;
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async function submitPayload(payload) {
    const ok = await sendToSheet(payload);
    if (ok) return true;

    // Save for retry later (e.g. no connection right now).
    const queue = readQueue();
    queue.push(payload);
    writeQueue(queue);
    return false;
  }

  async function flushQueue() {
    const queue = readQueue();
    if (!queue.length) return;
    const remaining = [];
    for (const payload of queue) {
      const ok = await sendToSheet(payload);
      if (!ok) remaining.push(payload);
    }
    writeQueue(remaining);
  }

  window.addEventListener('online', flushQueue);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') flushQueue();
  });

  // ---- Init ----

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  flushQueue();
  render();
})();
