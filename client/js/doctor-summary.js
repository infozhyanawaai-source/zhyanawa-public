'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const accessPanel = document.getElementById('access-panel');
  const summaryPanel = document.getElementById('summary-panel');
  const form = document.getElementById('access-form');
  const input = document.getElementById('access-code');
  const errorNode = document.getElementById('access-error');
  const submit = document.getElementById('access-submit');
  const languageSelect = document.getElementById('summary-language');
  const copy = window.zhyanawaDoctorCopy;
  let currentLanguage = ['en', 'ckb', 'ar'].includes(localStorage.getItem('zhyanawa-language')) ? localStorage.getItem('zhyanawa-language') : 'en';

  function setLanguage(language) {
    currentLanguage = language;
    localStorage.setItem('zhyanawa-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
    languageSelect.value = language;
    copy.apply(document, language);
    document.title = `${copy.t('brand', language)} | Zhyanawa AI`;
  }
  languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
  setLanguage(currentLanguage);

  input.addEventListener('input', () => {
    const compact = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    const parts = compact.startsWith('ZHY') ? [compact.slice(0, 3), compact.slice(3, 7), compact.slice(7, 11), compact.slice(11, 15)] : [compact.slice(0, 4), compact.slice(4, 8), compact.slice(8, 12), compact.slice(12, 15)];
    input.value = parts.filter(Boolean).join('-');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    errorNode.textContent = '';
    submit.disabled = true;
    submit.textContent = copy.t('generating', currentLanguage);
    try {
      const response = await fetch('/api/doctor-access/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: input.value, language: currentLanguage })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(copy.t(response.status === 404 ? 'invalid' : 'summaryFailed', currentLanguage));
      renderSummary(payload.summary);
      accessPanel.hidden = true;
      summaryPanel.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      errorNode.textContent = error.message;
    } finally {
      submit.disabled = false;
      submit.textContent = copy.t('generate', currentLanguage);
    }
  });

  function renderSummary(summary) {
    document.getElementById('summary-patient').textContent = summary.patientName || copy.t('patient', currentLanguage);
    document.getElementById('summary-access').textContent = copy.t(summary.accessType === 'one_time' ? 'consumed' : 'reusable', currentLanguage);
    document.getElementById('summary-scope').textContent = `${summary.conversationCount} ${copy.t('conversations', currentLanguage)} · ${summary.messageCount} ${copy.t('messages', currentLanguage)}`;
    const generated = new Date(summary.generatedAt);
    document.getElementById('summary-date').textContent = Number.isNaN(generated.getTime()) ? copy.t('justNow', currentLanguage) : new Intl.DateTimeFormat(currentLanguage, { dateStyle: 'medium', timeStyle: 'short' }).format(generated);
    document.getElementById('summary-notice').textContent = copy.t('notice', currentLanguage);
    const list = document.getElementById('summary-lines');
    list.dir = ['ckb', 'ar'].includes(summary.language) ? 'rtl' : 'ltr';
    list.lang = summary.language || 'en';
    list.replaceChildren(...summary.lines.map(line => {
      const item = document.createElement('li');
      item.textContent = line;
      return item;
    }));
  }

  document.getElementById('print-summary').addEventListener('click', () => window.print());
  document.getElementById('new-code').addEventListener('click', () => {
    summaryPanel.hidden = true;
    accessPanel.hidden = false;
    input.value = '';
    errorNode.textContent = '';
    input.focus();
  });
});
