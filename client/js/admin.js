'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const loginScreen = document.getElementById('login-screen');
  const adminShell = document.getElementById('admin-shell');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const doctorDialog = document.getElementById('doctor-dialog');
  const doctorForm = document.getElementById('doctor-form');
  const messageDialog = document.getElementById('message-dialog');
  const sidebar = document.getElementById('admin-sidebar');
  const toast = document.getElementById('admin-toast');

  const state = {
    doctors: [],
    users: [],
    usageUsers: [],
    usageRecent: [],
    audit: [],
    auditPagination: { page: 1, pages: 1, total: 0 },
    messages: [],
    doctorAccess: [],
    activeMessage: null,
    view: 'dashboard'
  };
  let toastTimer;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function notify(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  async function api(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'same-origin',
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401 && path !== '/api/admin/login') showLogin();
    if (!response.ok) throw new Error(payload.error?.message || 'Request failed.');
    return payload;
  }

  function showLogin() {
    adminShell.hidden = true;
    loginScreen.hidden = false;
    document.getElementById('login-password').value = '';
  }

  function showAdmin(email) {
    loginScreen.hidden = true;
    adminShell.hidden = false;
    document.getElementById('admin-email').textContent = email || 'Administrator';
    switchView(state.view);
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en').format(Number(value) || 0);
  }

  function formatMoney(micros) {
    if (micros === null || micros === undefined) return 'Not priced';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(Number(micros) / 1_000_000);
  }

  function statusPill(status) {
    return `<span class="status-pill ${escapeHtml(status)}">${escapeHtml(status)}</span>`;
  }

  function renderRecent(messages) {
    const body = document.getElementById('recent-messages-body');
    const empty = document.getElementById('recent-empty');
    empty.hidden = messages.length > 0;
    body.innerHTML = messages.map(message => `
      <tr>
        <td><div class="cell-title"><strong>${escapeHtml(message.name)}</strong><small>${escapeHtml(message.email)}</small></div></td>
        <td>${escapeHtml(message.subject)}</td>
        <td>${statusPill(message.status)}</td>
        <td>${escapeHtml(formatDate(message.created_at))}</td>
      </tr>
    `).join('');
  }

  async function loadDashboard() {
    const payload = await api('/api/admin/dashboard');
    document.getElementById('stat-doctors').textContent = payload.stats.doctors;
    document.getElementById('stat-unread').textContent = payload.stats.unreadMessages;
    document.getElementById('stat-messages').textContent = payload.stats.messages;
    document.getElementById('stat-hidden').textContent = payload.stats.hiddenDoctors;
    document.getElementById('stat-users').textContent = payload.stats.users;
    document.getElementById('stat-google-users').textContent = payload.stats.googleUsers;
    document.getElementById('stat-conversations').textContent = payload.stats.conversations;
    document.getElementById('stat-ai-requests').textContent = formatNumber(payload.stats.aiRequests);
    document.getElementById('stat-total-tokens').textContent = formatNumber(payload.stats.totalTokens);
    document.getElementById('stat-total-spend').textContent = formatMoney(payload.stats.totalSpendMicros);
    const unread = document.getElementById('nav-unread-count');
    unread.textContent = payload.stats.unreadMessages;
    unread.hidden = payload.stats.unreadMessages === 0;
    renderRecent(payload.recentMessages || []);
  }

  function renderDoctors() {
    const query = document.getElementById('doctor-admin-search').value.trim().toLowerCase();
    const visible = state.doctors.filter(doctor => {
      const haystack = `${doctor.name_en} ${doctor.title_en} ${doctor.clinic_en}`.toLowerCase();
      return !query || haystack.includes(query);
    });
    document.getElementById('doctor-admin-count').textContent = `${visible.length} doctor${visible.length === 1 ? '' : 's'}`;
    document.getElementById('doctors-table-body').innerHTML = visible.map(doctor => `
      <tr>
        <td><div class="cell-title"><strong>${escapeHtml(doctor.name_en)}</strong><small>${escapeHtml(doctor.title_en)}</small></div></td>
        <td>${escapeHtml(doctor.clinic_en)}</td>
        <td>${escapeHtml(doctor.location.replace(/-/g, ' '))}</td>
        <td>${statusPill(doctor.active ? 'visible' : 'hidden')}</td>
        <td><button class="row-action" type="button" data-edit-doctor="${doctor.id}">Edit</button></td>
      </tr>
    `).join('');
  }

  async function loadDoctors() {
    const payload = await api('/api/admin/doctors');
    state.doctors = payload.doctors || [];
    renderDoctors();
  }

  function renderUsers() {
    const query = document.getElementById('user-admin-search').value.trim().toLowerCase();
    const visible = state.users.filter(user => !query || `${user.name} ${user.email}`.toLowerCase().includes(query));
    document.getElementById('user-admin-count').textContent = `${visible.length} user${visible.length === 1 ? '' : 's'}`;
    document.getElementById('users-empty').hidden = visible.length > 0;
    document.getElementById('users-table-body').innerHTML = visible.map(user => `
      <tr>
        <td><div class="cell-title"><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)}</small></div></td>
        <td><span class="provider-label">${escapeHtml(user.provider)}</span></td>
        <td>${escapeHtml(user.chatCount)}</td>
        <td>${escapeHtml(formatNumber(user.requestCount))}</td>
        <td>${escapeHtml(formatNumber(user.totalTokens))}</td>
        <td>${escapeHtml(formatMoney(user.totalSpendMicros))}</td>
        <td>${statusPill(user.status)}</td>
        <td>${escapeHtml(formatDate(user.createdAt))}</td>
        <td>${user.lastLoginAt ? escapeHtml(formatDate(user.lastLoginAt)) : 'Never'}</td>
        <td><button class="row-action" type="button" data-user-status="${user.id}" data-next-status="${user.status === 'active' ? 'suspended' : 'active'}">${user.status === 'active' ? 'Suspend' : 'Activate'}</button></td>
      </tr>
    `).join('');
  }

  async function loadUsers() {
    const payload = await api('/api/admin/users');
    state.users = payload.users || [];
    renderUsers();
  }

  function renderUsageUsers() {
    const query = document.getElementById('usage-user-search').value.trim().toLowerCase();
    const visible = state.usageUsers.filter(user => !query || `${user.name} ${user.email}`.toLowerCase().includes(query));
    document.getElementById('usage-user-count').textContent = `${visible.length} user${visible.length === 1 ? '' : 's'}`;
    document.getElementById('usage-users-empty').hidden = visible.length > 0;
    document.getElementById('usage-users-table-body').innerHTML = visible.map(user => `
      <tr>
        <td><div class="cell-title"><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)}</small></div></td>
        <td>${escapeHtml(formatNumber(user.requestCount))}</td>
        <td>${escapeHtml(formatNumber(user.promptTokens))}</td>
        <td>${escapeHtml(formatNumber(user.completionTokens))}</td>
        <td>${escapeHtml(formatNumber(user.reasoningTokens))}</td>
        <td><strong>${escapeHtml(formatNumber(user.totalTokens))}</strong></td>
        <td><div class="cell-title"><strong>${escapeHtml(formatMoney(user.costMicros))}</strong>${user.unpricedRequests ? `<small>${escapeHtml(user.unpricedRequests)} unpriced</small>` : ''}</div></td>
        <td>${user.lastUsedAt ? escapeHtml(formatDate(user.lastUsedAt)) : 'Never'}</td>
      </tr>
    `).join('');
  }

  function renderUsageRecent() {
    document.getElementById('usage-recent-empty').hidden = state.usageRecent.length > 0;
    document.getElementById('usage-recent-table-body').innerHTML = state.usageRecent.map(item => `
      <tr>
        <td>${escapeHtml(formatDate(item.createdAt))}</td>
        <td><div class="cell-title"><strong>${escapeHtml(item.userName)}</strong><small>${escapeHtml(item.userEmail || 'Anonymous')}</small></div></td>
        <td><span class="model-label" title="${escapeHtml(item.model)}">${escapeHtml(item.model || 'Local')}</span></td>
        <td><div class="cell-title"><strong>${escapeHtml(item.reasoningEffort || item.researchMode || 'Local')}</strong><small>${escapeHtml(item.language)}</small></div></td>
        <td><div class="cell-title"><strong>${escapeHtml(formatNumber(item.totalTokens))}</strong><small>${escapeHtml(formatNumber(item.promptTokens))} in · ${escapeHtml(formatNumber(item.completionTokens))} out</small></div></td>
        <td><div class="cell-title"><strong>${escapeHtml(formatMoney(item.costMicros))}</strong><small>${escapeHtml(item.costSource)}</small></div></td>
        <td>${escapeHtml(formatNumber(item.latencyMs))} ms</td>
        <td>${statusPill(item.status)}</td>
      </tr>
    `).join('');
  }

  async function loadUsage() {
    const days = document.getElementById('usage-range-filter').value;
    const payload = await api(`/api/admin/usage?days=${encodeURIComponent(days)}`);
    state.usageUsers = payload.users || [];
    state.usageRecent = payload.recent || [];
    const summary = payload.summary || {};
    document.getElementById('usage-stat-requests').textContent = formatNumber(summary.requests);
    document.getElementById('usage-stat-completion').textContent = `${formatNumber(summary.completed)} completed · ${formatNumber(summary.failed)} failed`;
    document.getElementById('usage-stat-tokens').textContent = formatNumber(summary.total_tokens);
    document.getElementById('usage-stat-spend').textContent = formatMoney(summary.cost_micros);
    document.getElementById('usage-stat-pricing').textContent = summary.unpriced_requests
      ? `${formatNumber(summary.unpriced_requests)} request${summary.unpriced_requests === 1 ? '' : 's'} not priced`
      : 'All requests priced';
    document.getElementById('usage-stat-users').textContent = formatNumber(summary.active_users);
    document.getElementById('usage-stat-guests').textContent = `${formatNumber(summary.guest_requests)} guest requests`;
    renderUsageUsers();
    renderUsageRecent();
  }

  function renderAudit() {
    document.getElementById('audit-empty').hidden = state.audit.length > 0;
    document.getElementById('audit-table-body').innerHTML = state.audit.map(item => {
      const metadata = item.metadata && Object.keys(item.metadata).length ? JSON.stringify(item.metadata, null, 2) : '';
      return `
        <tr>
          <td>${escapeHtml(formatDate(item.createdAt))}</td>
          <td><div class="cell-title"><strong>${escapeHtml(item.actorEmail || item.actorType)}</strong><small>${escapeHtml(item.actorType)}${item.actorId ? ` #${escapeHtml(item.actorId)}` : ''}</small></div></td>
          <td><code class="audit-action">${escapeHtml(item.action)}</code></td>
          <td>${item.targetType ? `<div class="cell-title"><strong>${escapeHtml(item.targetType)}</strong><small>${escapeHtml(item.targetId || '—')}</small></div>` : '—'}</td>
          <td>${statusPill(item.outcome)}</td>
          <td><code>${escapeHtml(item.ipAddress || '—')}</code></td>
          <td>${metadata || item.userAgent ? `<details class="audit-details"><summary>View</summary>${metadata ? `<pre>${escapeHtml(metadata)}</pre>` : ''}${item.userAgent ? `<small>${escapeHtml(item.userAgent)}</small>` : ''}</details>` : '—'}</td>
        </tr>
      `;
    }).join('');
    const paging = state.auditPagination;
    document.getElementById('audit-page-summary').textContent = paging.total
      ? `Page ${formatNumber(paging.page)} of ${formatNumber(paging.pages)} · ${formatNumber(paging.total)} events`
      : '0 events';
    document.getElementById('audit-previous').disabled = paging.page <= 1;
    document.getElementById('audit-next').disabled = paging.page >= paging.pages;
  }

  async function loadAudit(page = state.auditPagination.page || 1) {
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    const search = document.getElementById('audit-search').value.trim();
    const actorType = document.getElementById('audit-actor-filter').value;
    const outcome = document.getElementById('audit-outcome-filter').value;
    if (search) params.set('search', search);
    if (actorType) params.set('actorType', actorType);
    if (outcome) params.set('outcome', outcome);
    const payload = await api(`/api/admin/audit?${params}`);
    state.audit = payload.items || [];
    state.auditPagination = payload.pagination || { page: 1, pages: 1, total: 0 };
    renderAudit();
  }

  function renderMessages() {
    const body = document.getElementById('messages-table-body');
    const empty = document.getElementById('messages-empty');
    empty.hidden = state.messages.length > 0;
    body.innerHTML = state.messages.map(message => `
      <tr>
        <td><div class="cell-title"><strong>${escapeHtml(message.name)}</strong><small>${escapeHtml(message.email)}</small></div></td>
        <td>${escapeHtml(message.subject)}</td>
        <td>${statusPill(message.status)}</td>
        <td>${escapeHtml(formatDate(message.created_at))}</td>
        <td><button class="row-action" type="button" data-open-message="${message.id}">View</button></td>
      </tr>
    `).join('');
  }

  async function loadMessages() {
    const status = document.getElementById('message-status-filter').value;
    const payload = await api(`/api/admin/messages?status=${encodeURIComponent(status)}`);
    state.messages = payload.messages || [];
    renderMessages();
  }

  function renderDoctorAccess() {
    const query = document.getElementById('doctor-access-search').value.trim().toLowerCase();
    const status = document.getElementById('doctor-access-status').value;
    const visible = state.doctorAccess.filter(item => (status === 'all' || item.status === status) && (!query || `${item.user.name} ${item.user.email} ${item.codeHint}`.toLowerCase().includes(query)));
    for (const value of ['active', 'used', 'revoked']) {
      document.getElementById(`doctor-access-${value}`).textContent = formatNumber(state.doctorAccess.filter(item => item.status === value).length);
    }
    document.getElementById('doctor-access-count').textContent = `${visible.length} code${visible.length === 1 ? '' : 's'}`;
    document.getElementById('doctor-access-empty').hidden = visible.length > 0;
    document.getElementById('doctor-access-table-body').innerHTML = visible.map(item => `
      <tr>
        <td><div class="cell-title"><strong>${escapeHtml(item.user.name)}</strong><small>${escapeHtml(item.user.email)}</small></div></td>
        <td><code>${escapeHtml(item.codeHint)}</code></td>
        <td>${escapeHtml(item.accessType === 'one_time' ? 'One-time' : 'Lifetime')}</td>
        <td>${statusPill(item.status)}</td>
        <td>${escapeHtml(formatNumber(item.accessCount))}</td>
        <td>${escapeHtml({ en: 'English', ckb: 'Sorani', ar: 'Arabic' }[item.summaryLanguage] || '—')}</td>
        <td>${escapeHtml(formatDate(item.createdAt))}</td>
        <td>${item.lastAccessedAt ? escapeHtml(formatDate(item.lastAccessedAt)) : 'Never'}</td>
        <td>${item.status === 'active' ? `<button class="row-action danger-row-action" type="button" data-revoke-doctor-access="${item.id}">Revoke</button>` : '—'}</td>
      </tr>
    `).join('');
  }

  async function loadDoctorAccess() {
    const payload = await api('/api/admin/doctor-access');
    state.doctorAccess = payload.codes || [];
    renderDoctorAccess();
  }

  async function switchView(view) {
    state.view = view;
    document.querySelectorAll('.admin-view').forEach(section => section.classList.toggle('is-active', section.id === `view-${view}`));
    document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('is-active', button.dataset.view === view));
    document.getElementById('view-title').textContent = { dashboard: 'Overview', doctors: 'Doctors', users: 'Users', usage: 'AI usage & spend', audit: 'Audit log', messages: 'Messages', 'doctor-access': 'Doctor summaries' }[view];
    sidebar.classList.remove('is-open');
    document.getElementById('menu-button').setAttribute('aria-expanded', 'false');
    try {
      if (view === 'dashboard') await loadDashboard();
      if (view === 'doctors') await loadDoctors();
      if (view === 'users') await loadUsers();
      if (view === 'usage') await loadUsage();
      if (view === 'audit') await loadAudit(1);
      if (view === 'messages') await loadMessages();
      if (view === 'doctor-access') await loadDoctorAccess();
    } catch (error) {
      notify(error.message);
    }
  }

  function setDoctorFormValue(name, value) {
    const field = doctorForm.elements.namedItem(name);
    if (!field) return;
    if (field.type === 'checkbox') field.checked = Boolean(value);
    else field.value = value ?? '';
  }

  function openDoctor(doctor = null) {
    doctorForm.reset();
    document.getElementById('doctor-form-error').textContent = '';
    document.getElementById('doctor-dialog-title').textContent = doctor ? 'Edit doctor' : 'Add doctor';
    setDoctorFormValue('id', doctor?.id || '');
    ['name_en', 'name_ckb', 'name_ar', 'title_en', 'title_ckb', 'title_ar', 'clinic_en', 'clinic_ckb', 'clinic_ar', 'location', 'image_path', 'map_url', 'sort_order']
      .forEach(name => setDoctorFormValue(name, doctor?.[name]));
    setDoctorFormValue('specialties', doctor?.specialties || 'adult');
    setDoctorFormValue('phones', doctor?.phones?.join(', ') || '');
    setDoctorFormValue('verified', doctor ? doctor.verified : true);
    setDoctorFormValue('active', doctor ? doctor.active : true);
    doctorDialog.showModal();
  }

  async function saveDoctorRecord(event) {
    event.preventDefault();
    const formData = new FormData(doctorForm);
    const id = formData.get('id');
    const body = Object.fromEntries(formData.entries());
    body.phones = String(body.phones || '').split(',').map(value => value.trim()).filter(Boolean);
    body.specialties = String(body.specialties || '').split(',').map(value => value.trim()).filter(Boolean);
    body.verified = doctorForm.elements.namedItem('verified').checked;
    body.active = doctorForm.elements.namedItem('active').checked;
    body.sort_order = Number(body.sort_order || 0);
    delete body.id;

    const errorNode = document.getElementById('doctor-form-error');
    const saveButton = document.getElementById('save-doctor-button');
    errorNode.textContent = '';
    saveButton.disabled = true;
    try {
      await api(id ? `/api/admin/doctors/${id}` : '/api/admin/doctors', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(body)
      });
      doctorDialog.close();
      await loadDoctors();
      notify(id ? 'Doctor updated.' : 'Doctor added.');
    } catch (error) {
      errorNode.textContent = error.message;
    } finally {
      saveButton.disabled = false;
    }
  }

  async function openMessage(message) {
    state.activeMessage = message;
    document.getElementById('message-dialog-subject').textContent = message.subject;
    document.getElementById('message-dialog-sender').textContent = `${message.name} · ${message.email}`;
    document.getElementById('message-dialog-date').textContent = formatDate(message.created_at);
    document.getElementById('message-dialog-content').textContent = message.message;
    document.getElementById('reply-message-link').href = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`;
    document.getElementById('archive-message-button').hidden = message.status === 'archived';
    messageDialog.showModal();
    if (message.status === 'unread') {
      try {
        const payload = await api(`/api/admin/messages/${message.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'read' }) });
        state.activeMessage = payload.message;
        await loadMessages();
        await loadDashboard();
      } catch (error) {
        notify(error.message);
      }
    }
  }

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginError.textContent = '';
    const submit = loginForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const payload = await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('login-email').value,
          password: document.getElementById('login-password').value
        })
      });
      showAdmin(payload.email);
    } catch (error) {
      loginError.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });

  document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
  document.querySelectorAll('[data-go-view]').forEach(button => button.addEventListener('click', () => switchView(button.dataset.goView)));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.closeDialog).close()));

  document.getElementById('refresh-dashboard').addEventListener('click', () => loadDashboard().then(() => notify('Dashboard refreshed.')).catch(error => notify(error.message)));
  document.getElementById('add-doctor-button').addEventListener('click', () => openDoctor());
  document.getElementById('doctor-admin-search').addEventListener('input', renderDoctors);
  document.getElementById('user-admin-search').addEventListener('input', renderUsers);
  document.getElementById('usage-user-search').addEventListener('input', renderUsageUsers);
  document.getElementById('refresh-users').addEventListener('click', () => loadUsers().then(() => notify('Users refreshed.')).catch(error => notify(error.message)));
  document.getElementById('usage-range-filter').addEventListener('change', () => loadUsage().catch(error => notify(error.message)));
  document.getElementById('refresh-usage').addEventListener('click', () => loadUsage().then(() => notify('Usage refreshed.')).catch(error => notify(error.message)));
  document.getElementById('refresh-audit').addEventListener('click', () => loadAudit().then(() => notify('Audit log refreshed.')).catch(error => notify(error.message)));
  document.getElementById('apply-audit-filters').addEventListener('click', () => loadAudit(1).catch(error => notify(error.message)));
  document.getElementById('audit-search').addEventListener('keydown', event => {
    if (event.key === 'Enter') loadAudit(1).catch(error => notify(error.message));
  });
  document.getElementById('audit-previous').addEventListener('click', () => loadAudit(state.auditPagination.page - 1).catch(error => notify(error.message)));
  document.getElementById('audit-next').addEventListener('click', () => loadAudit(state.auditPagination.page + 1).catch(error => notify(error.message)));
  document.getElementById('message-status-filter').addEventListener('change', () => loadMessages().catch(error => notify(error.message)));
  document.getElementById('doctor-access-search').addEventListener('input', renderDoctorAccess);
  document.getElementById('doctor-access-status').addEventListener('change', renderDoctorAccess);
  document.getElementById('refresh-doctor-access').addEventListener('click', () => loadDoctorAccess().then(() => notify('Doctor access refreshed.')).catch(error => notify(error.message)));
  doctorForm.addEventListener('submit', saveDoctorRecord);

  document.getElementById('doctors-table-body').addEventListener('click', event => {
    const button = event.target.closest('[data-edit-doctor]');
    if (!button) return;
    openDoctor(state.doctors.find(doctor => doctor.id === Number(button.dataset.editDoctor)));
  });

  document.getElementById('messages-table-body').addEventListener('click', event => {
    const button = event.target.closest('[data-open-message]');
    if (!button) return;
    const message = state.messages.find(item => item.id === Number(button.dataset.openMessage));
    if (message) openMessage(message);
  });

  document.getElementById('users-table-body').addEventListener('click', async event => {
    const button = event.target.closest('[data-user-status]');
    if (!button) return;
    button.disabled = true;
    try {
      await api(`/api/admin/users/${button.dataset.userStatus}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: button.dataset.nextStatus })
      });
      await loadUsers();
      await loadDashboard();
      notify(button.dataset.nextStatus === 'active' ? 'User activated.' : 'User suspended.');
    } catch (error) {
      notify(error.message);
      button.disabled = false;
    }
  });

  document.getElementById('doctor-access-table-body').addEventListener('click', async event => {
    const button = event.target.closest('[data-revoke-doctor-access]');
    if (!button || !confirm('Revoke this patient-created doctor access code?')) return;
    button.disabled = true;
    try {
      await api(`/api/admin/doctor-access/${button.dataset.revokeDoctorAccess}`, { method: 'DELETE' });
      await loadDoctorAccess();
      notify('Doctor access code revoked.');
    } catch (error) {
      notify(error.message);
      button.disabled = false;
    }
  });

  document.getElementById('archive-message-button').addEventListener('click', async () => {
    if (!state.activeMessage) return;
    try {
      await api(`/api/admin/messages/${state.activeMessage.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'archived' }) });
      messageDialog.close();
      await loadMessages();
      await loadDashboard();
      notify('Message archived.');
    } catch (error) {
      notify(error.message);
    }
  });

  document.getElementById('logout-button').addEventListener('click', async () => {
    try { await api('/api/admin/logout', { method: 'POST' }); } catch { /* Clear the local view even if logout fails. */ }
    showLogin();
  });

  document.getElementById('menu-button').addEventListener('click', event => {
    const isOpen = sidebar.classList.toggle('is-open');
    event.currentTarget.setAttribute('aria-expanded', String(isOpen));
  });

  [doctorDialog, messageDialog].forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  });

  api('/api/admin/session')
    .then(payload => showAdmin(payload.email))
    .catch(() => showLogin());
});
