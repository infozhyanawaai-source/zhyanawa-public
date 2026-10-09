/**
 * ZHYANAWA AI — Premium Chatbot Application Controller
 * Handles conversation flow, suggestion card prompts, session management,
 * speech synthesis/voice recognition, localized responses, and crisis detection.
 */

document.addEventListener('DOMContentLoaded', () => {
  const i18n = window.zhyanawaI18n;
  const doctorCopy = window.zhyanawaDoctorCopy;
  const doctorT = key => doctorCopy?.t(key, i18n?.language || 'en') || key;

  // --- Element Selectors ---
  const welcomeHero = document.getElementById('chat-welcome-hero');
  const messagesThread = document.getElementById('chat-conversation-thread');
  const messagesContainer = document.getElementById('chat-messages-container');
  const chatMainCanvas = document.getElementById('chat-main-canvas');
  const chatInputCapsule = document.querySelector('.chat-input-capsule');
  const chatInput = document.getElementById('chat-input-field');
  const sendBtn = document.getElementById('chat-send-btn');
  const micBtn = document.getElementById('chat-mic-btn');
  const btnNewChat = document.getElementById('btn-new-chat');
  const historyList = document.querySelector('.recent-chats-list');
  const clearHistoryBtn = document.getElementById('btn-clear-history');

  // Modals & Controls
  const profileModal = document.getElementById('profile-modal');
  const profileModalClose = document.getElementById('profile-modal-close');
  const btnProfileTrigger = document.getElementById('nav-profile-btn');
  const sidebarProfileTrigger = document.getElementById('sidebar-profile-btn');
  const profileNameNodes = document.querySelectorAll('[data-profile-name]');
  const profileAvatarNodes = document.querySelectorAll('[data-profile-avatar]');
  const btnDoctorCodeTrigger = document.getElementById('nav-doctor-code-btn');
  const btnLogoutTrigger = document.getElementById('nav-logout-btn');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('chat-sidebar');
  const sidebarScrim = document.getElementById('sidebar-scrim');
  const toast = document.getElementById('chat-toast');
  const accountStatusText = document.getElementById('account-status-text');
  const profileTitle = document.getElementById('profile-title');
  const profileSubtitle = document.getElementById('profile-subtitle');
  const profileAccount = document.getElementById('profile-account');
  const profileStorage = document.getElementById('profile-storage');
  const profileRetention = document.getElementById('profile-retention');
  const profileExportButton = document.getElementById('profile-export-button');
  const profileDoneButton = document.getElementById('profile-done-button');
  const doctorCodeModal = document.getElementById('doctor-code-modal');
  const doctorCodeClose = document.getElementById('doctor-code-close');
  const doctorCodeCreate = document.getElementById('doctor-code-create');
  const doctorCodeRefresh = document.getElementById('doctor-code-refresh');
  const doctorCodeList = document.getElementById('doctor-code-list');
  const doctorCodeError = document.getElementById('doctor-code-error');
  const doctorCodeResult = document.getElementById('doctor-code-result');
  const doctorCodeValue = document.getElementById('doctor-code-value');
  const doctorCodeCopy = document.getElementById('doctor-code-copy');

  // Language Dropdown
  const langDropdown = document.getElementById('chat-lang-dropdown');
  const langTrigger = document.getElementById('chat-lang-trigger');
  const langCodeSpan = document.getElementById('chat-current-lang-code');

  // State
  let currentMessages = [];
  let isTyping = false;
  let isRecording = false;
  let speechSynthActive = false;
  let toastTimer = null;
  let requestController = null;
  let requestVersion = 0;
  let languageMode = 'auto';
  let activeSessionId = null;
  let accountUser = null;
  let persistenceQueue = Promise.resolve();
  let saveErrorShown = false;
  let sessions = [];
  try { sessions = JSON.parse(sessionStorage.getItem('zhyanawa-chat-sessions') || '[]'); } catch { sessions = []; }
  if (!Array.isArray(sessions)) sessions = [];

  const chatLabels = {
    en: { preparing: 'Preparing a thoughtful reply…', researching: 'Searching trusted mental-health sources…', thinking: 'Thinking about your situation…', retrying: 'Reconnecting to the AI service…', sources: 'Sources checked online', unavailable: 'Live research unavailable', writing: 'Writing a reply…', empty: 'No conversations yet', saved: 'Saved to your account', profileSaved: 'Your conversations are securely saved to your Zhyanawa account.', storageAccount: 'Zhyanawa account database', retentionAccount: 'Until you clear your chat history', profileGuest: 'Guest Profile', guestSubtitle: 'Guest conversations stay only in this browser tab.', storageGuest: 'Temporary browser session', retentionGuest: 'Cleared when this tab closes' },
    ckb: { preparing: 'ئامادەکردنی وەڵامێکی بەوردی…', researching: 'گەڕان لە سەرچاوە متمانەپێکراوەکانی تەندروستی دەروونی…', thinking: 'بیرکردنەوە لە بارودۆخەکەت…', retrying: 'هەوڵدانەوە بۆ پەیوەستبوون بە خزمەتگوزاریی ژیری دەستکرد…', sources: 'سەرچاوە پشکنراوەکانی سەرهێڵ', unavailable: 'پشکنینی سەرهێڵ بەردەست نییە', writing: 'نووسینی وەڵام…', empty: 'هێشتا گفتوگۆیەک نییە', saved: 'لە هەژمارەکەتدا پاشەکەوت کراوە', profileSaved: 'گفتوگۆکانت بە پارێزراوی لە هەژماری ژیانەوەکەتدا پاشەکەوت دەکرێن.', storageAccount: 'داتابەیسی هەژماری ژیانەوە', retentionAccount: 'هەتا مێژووی گفتوگۆکانت دەسڕیتەوە', profileGuest: 'پڕۆفایلی میوان', guestSubtitle: 'گفتوگۆکانی میوان تەنها لەم تابەدا دەمێننەوە.', storageGuest: 'دانیشتنی کاتیی وێبگەڕ', retentionGuest: 'کاتێک تابەکە دادەخەیت دەسڕدرێتەوە' },
    ar: { preparing: 'تحضير رد مدروس…', researching: 'البحث في مصادر موثوقة للصحة النفسية…', thinking: 'التفكير في حالتك…', retrying: 'إعادة الاتصال بخدمة الذكاء الاصطناعي…', sources: 'مصادر تم التحقق منها عبر الإنترنت', unavailable: 'البحث المباشر غير متاح', writing: 'كتابة الرد…', empty: 'لا توجد محادثات بعد', saved: 'محفوظة في حسابك', profileSaved: 'تُحفظ محادثاتك بأمان في حساب ذيانەوە.', storageAccount: 'قاعدة بيانات حساب ذيانەوە', retentionAccount: 'حتى تمسح سجل المحادثات', profileGuest: 'ملف الضيف', guestSubtitle: 'تبقى محادثات الضيف في علامة التبويب هذه فقط.', storageGuest: 'جلسة متصفح مؤقتة', retentionGuest: 'تُمسح عند إغلاق علامة التبويب' }
  };
  function chatLabel(key) { return (chatLabels[i18n?.language || 'en'] || chatLabels.en)[key]; }

  function cancelActiveReply() {
    requestVersion += 1;
    requestController?.abort();
    requestController = null;
    isTyping = false;
    if (sendBtn) sendBtn.disabled = false;
    document.getElementById('typing-indicator')?.remove();
  }

  function persistSession() {
    if (!currentMessages.length) return;
    if (!activeSessionId) activeSessionId = crypto.randomUUID();
    const entry = { id: activeSessionId, language: i18n?.language || 'en', messages: currentMessages.filter(message => message.text).map(message => ({ ...message })), updatedAt: new Date().toISOString() };
    sessions = [entry, ...sessions.filter(session => session.id !== activeSessionId)].slice(0, 20);
    if (accountUser) {
      persistenceQueue = persistenceQueue.catch(() => {}).then(async () => {
        const response = await fetch(`${API_BASE}/api/chat/sessions/${encodeURIComponent(entry.id)}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: entry.language, messages: entry.messages })
        });
        if (!response.ok) throw new Error('Your chat could not be saved. Please sign in again.');
        saveErrorShown = false;
      }).catch(error => {
        if (!saveErrorShown) showToast(error.message);
        saveErrorShown = true;
      });
    } else {
      try { sessionStorage.setItem('zhyanawa-chat-sessions', JSON.stringify(sessions)); } catch { /* Chat works even if browser storage is unavailable. */ }
    }
    renderHistory();
  }

  function updateProfileIdentity(user) {
    const localizedProfile = i18n?.t('chatNavProfile') || 'Profile';
    const displayName = user?.name?.trim() || user?.email?.split('@')[0] || localizedProfile;
    const initial = displayName.charAt(0).toLocaleUpperCase() || 'P';
    const avatarUrl = /^https:\/\//i.test(user?.avatarUrl || '') ? user.avatarUrl : '';

    profileNameNodes.forEach(node => {
      if (user) node.removeAttribute('data-i18n');
      else node.dataset.i18n = 'chatNavProfile';
      node.textContent = user ? displayName : localizedProfile;
    });

    profileAvatarNodes.forEach(node => {
      const image = node.querySelector('[data-profile-image]');
      const fallback = node.querySelector('[data-profile-initial]');
      if (fallback) {
        fallback.textContent = user ? initial : localizedProfile.charAt(0).toLocaleUpperCase();
        fallback.hidden = Boolean(avatarUrl);
      }
      if (image) {
        image.hidden = !avatarUrl;
        if (avatarUrl) {
          image.src = avatarUrl;
          image.onerror = () => {
            image.hidden = true;
            if (fallback) fallback.hidden = false;
          };
        } else {
          image.removeAttribute('src');
        }
      }
    });

    [btnProfileTrigger, sidebarProfileTrigger].forEach(button => {
      if (!button) return;
      button.classList.toggle('is-authenticated', Boolean(user));
      const accessibleLabel = user ? `${localizedProfile}: ${displayName}` : localizedProfile;
      button.setAttribute('aria-label', accessibleLabel);
      button.title = accessibleLabel;
    });
  }

  function updateAccountUI() {
    if (accountUser) {
      if (accountStatusText) {
        accountStatusText.removeAttribute('data-i18n');
        accountStatusText.textContent = accountUser.email;
      }
      if (profileTitle) profileTitle.textContent = accountUser.name;
      if (profileSubtitle) profileSubtitle.textContent = accountUser.email;
      if (profileAccount) profileAccount.textContent = accountUser.email;
      if (profileStorage) profileStorage.textContent = chatLabel('storageAccount');
      if (profileRetention) profileRetention.textContent = chatLabel('retentionAccount');
      updateProfileIdentity(accountUser);
    } else {
      if (accountStatusText) {
        accountStatusText.dataset.i18n = 'chatAnonymousBadge';
        accountStatusText.textContent = i18n ? i18n.t('chatAnonymousBadge') : 'Anonymous Guest Session';
      }
      if (profileTitle) profileTitle.textContent = chatLabel('profileGuest');
      if (profileSubtitle) profileSubtitle.textContent = chatLabel('guestSubtitle');
      if (profileAccount) profileAccount.textContent = 'Anonymous guest';
      if (profileStorage) profileStorage.textContent = chatLabel('storageGuest');
      if (profileRetention) profileRetention.textContent = chatLabel('retentionGuest');
      updateProfileIdentity(null);
    }
  }

  async function initializeChatIdentity() {
    try {
      const authResponse = await fetch(`${API_BASE}/api/auth/session`, { credentials: 'include', cache: 'no-store' });
      if (!authResponse.ok) throw new Error('guest');
      accountUser = (await authResponse.json()).user;
    } catch {
      accountUser = null;
      updateAccountUI();
      renderHistory();
      return;
    }
    try {
      const historyResponse = await fetch(`${API_BASE}/api/chat/sessions`, { credentials: 'include', cache: 'no-store' });
      if (!historyResponse.ok) throw new Error('history');
      const payload = await historyResponse.json();
      sessions = Array.isArray(payload.sessions) ? payload.sessions : [];
    } catch {
      sessions = [];
      showToast('Saved chat history could not be loaded.');
    }
    updateAccountUI();
    renderHistory();
  }

  function renderHistory() {
    if (!historyList) return;
    historyList.replaceChildren();
    if (!sessions.length) {
      const empty = document.createElement('p');
      empty.className = 'chat-history-empty';
      empty.textContent = chatLabel('empty');
      historyList.appendChild(empty);
      return;
    }
    for (const session of sessions) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chat-history-item';
      button.classList.toggle('is-active', session.id === activeSessionId);
      button.textContent = session.messages.find(message => message.sender === 'user')?.text.slice(0, 58) || 'Chat';
      button.dir = 'auto';
      button.addEventListener('click', () => {
        cancelActiveReply();
        activeSessionId = session.id;
        currentMessages = [];
        messagesThread.replaceChildren();
        i18n?.applyLanguage(session.language);
        updateChatLanguageUI(session.language);
        session.messages.forEach(message => {
          const row = appendMessage(message.sender, message.text, false);
          if (message.sourceInfo) appendCheckedSources(row, message.sourceInfo);
        });
        renderHistory();
        setSidebarOpen(false);
      });
      historyList.appendChild(button);
    }
  }

  const API_BASE = window.location.port === '4173' ? 'http://127.0.0.1:3000' : '';

  // =========================================================================
  // 1. Core Chat Functions
  // =========================================================================

  function showWelcomeState() {
    cancelActiveReply();
    activeSessionId = null;
    if (welcomeHero) welcomeHero.style.display = 'flex';
    if (messagesThread) messagesThread.innerHTML = '';
    currentMessages = [];
    renderHistory();
    document.querySelectorAll('.chat-history-item').forEach(el => el.classList.remove('is-active'));
  }

  function hideWelcomeState() {
    if (welcomeHero) welcomeHero.style.display = 'none';
  }

  function scrollToBottom() {
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 50);
    }
  }

  function resizeChatInput() {
    if (!chatInput) return;
    chatInput.style.height = 'auto';
    const maxHeight = Number.parseFloat(getComputedStyle(chatInput).maxHeight) || 240;
    const nextHeight = Math.min(chatInput.scrollHeight, maxHeight);
    chatInput.style.height = `${nextHeight}px`;
    chatInput.style.overflowY = chatInput.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  function updateComposerSpace() {
    if (!chatMainCanvas || !chatInputCapsule) return;
    chatMainCanvas.style.setProperty('--chat-composer-space', `${chatInputCapsule.offsetHeight + 40}px`);
  }

  if (chatInputCapsule && 'ResizeObserver' in window) {
    let lastComposerWidth = 0;
    new ResizeObserver((entries) => {
      const width = Math.round(entries[0]?.contentRect.width || 0);
      if (width && width !== lastComposerWidth) {
        lastComposerWidth = width;
        resizeChatInput();
      }
      updateComposerSpace();
      scrollToBottom();
    }).observe(chatInputCapsule);
  }

  function appendMessage(sender, text, animate = true) {
    hideWelcomeState();

    const row = document.createElement('div');
    row.className = `message-row is-${sender}`;

    if (sender === 'ai') {
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.innerHTML = `<img src="assets/zhyanawa-logo-primary.jpg" alt="Zhyanawa AI">`;
      row.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    // Parse simple markdown-like formatting (bold, lists, linebreaks)
    bubble.innerHTML = formatMessageText(text);

    // If AI message, append action buttons (copy, speak, feedback)
    if (sender === 'ai') {
      const actions = document.createElement('div');
      actions.className = 'message-actions-bar';
      actions.innerHTML = `
        <button class="msg-action-btn" data-chat-action="copy" title="Copy text">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          <span>Copy</span>
        </button>
        <button class="msg-action-btn" data-chat-action="speak" title="Listen to response">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          <span>Listen</span>
        </button>
        <button class="msg-action-btn" data-chat-action="helpful" title="Mark helpful">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
        </button>
      `;
      bubble.appendChild(actions);
    }

    row.appendChild(bubble);
    messagesThread.appendChild(row);

    const message = { sender, text };
    row.chatMessage = message;
    currentMessages.push(message);
    scrollToBottom();

    return row;
  }

  function showTypingIndicator() {
    if (isTyping) return;
    isTyping = true;
    if (sendBtn) sendBtn.disabled = true;

    const row = document.createElement('div');
    row.className = 'typing-indicator-row';
    row.id = 'typing-indicator';
    row.innerHTML = `
      <div class="message-avatar">
        <img src="assets/zhyanawa-logo-primary.jpg" alt="Zhyanawa AI">
      </div>
      <div class="typing-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
      <span class="chat-progress" role="status">${chatLabel('preparing')}</span>
    `;
    messagesThread.appendChild(row);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function formatMessageText(text) {
    if (!text) return '';
    // Escape HTML
    let sanitized = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Remove Markdown separators before inline emphasis parsing.
    sanitized = sanitized.replace(/^\s*(?:---+|\*\*\*+)\s*$/gm, '');
    // Bold **text**
    sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italics *text*
    sanitized = sanitized.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Links, headings, horizontal rules, and list markers
    sanitized = sanitized.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    sanitized = sanitized.replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>');
    sanitized = sanitized.replace(/^\s*[-*]\s+(.+)$/gm, '• $1');

    // Convert newlines into paragraphs or linebreaks
    const lines = sanitized.split('\n\n');
    return lines.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  }

  // =========================================================================
  // 2. Real Zhyanawa Gateway + SSE Response Dispatcher
  // =========================================================================

  function updateAssistantMessage(row, text) {
    if (!row) return;
    const bubble = row.querySelector('.message-bubble');
    if (!bubble) return;
    const actions = bubble.querySelector('.message-actions-bar');
    bubble.innerHTML = formatMessageText(text);
    if (actions) bubble.appendChild(actions);
    if (row.chatMessage) row.chatMessage.text = text;
  }

  function setProgress(stage) {
    const progress = document.querySelector('#typing-indicator .chat-progress');
    if (progress) progress.textContent = chatLabel(stage);
  }

  function appendCheckedSources(row, research) {
    if (!row || !research) return;
    if (row.chatMessage) row.chatMessage.sourceInfo = research;
    const details = document.createElement('details');
    details.className = 'chat-checked-sources';
    const summary = document.createElement('summary');
    summary.textContent = research.status === 'unavailable' ? chatLabel('unavailable') : `${chatLabel('sources')} (${research.sources.length})`;
    details.appendChild(summary);
    for (const source of research.sources) {
      try {
        const url = new URL(source.url);
        if (url.protocol !== 'https:' || !['www.nhs.uk', 'www.nimh.nih.gov', 'www.nice.org.uk', 'www.who.int', 'www.samhsa.gov'].includes(url.hostname)) continue;
        const link = document.createElement('a');
        link.href = url.href;
        link.textContent = `${source.id}. ${source.title}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.dir = 'auto';
        details.appendChild(link);
      } catch { /* Skip invalid source metadata. */ }
    }
    row.querySelector('.message-bubble')?.appendChild(details);
  }

  async function requestAssistantReply(version) {
    if (!activeSessionId) activeSessionId = crypto.randomUUID();
    const payload = {
      conversationId: activeSessionId,
      language: i18n ? i18n.language : 'en',
      languageMode,
      messages: currentMessages.map((message) => ({
        role: message.sender === 'ai' ? 'assistant' : 'user',
        content: message.text
      }))
    };

    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(payload),
      signal: requestController.signal
    });

    if (!response.ok) {
      let detail = '';
      try {
        const errorPayload = await response.json();
        detail = errorPayload?.error?.message || '';
      } catch {
        detail = '';
      }
      throw new Error(detail || `Gateway request failed (${response.status})`);
    }

    const responseLanguage = response.headers.get('X-Zhyanawa-Language');
    if (i18n && ['en', 'ckb', 'ar'].includes(responseLanguage) && i18n.language !== responseLanguage) {
      i18n.applyLanguage(responseLanguage);
      updateChatLanguageUI(responseLanguage);
      renderHistory();
    }

    if (!response.body) throw new Error('The gateway returned an empty stream.');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let assistantRow = null;
    let research = null;

    function processEvent(event) {
      const lines = event.split(/\r?\n/);
      const eventName = lines.find(line => line.startsWith('event:'))?.slice(6).trim() || 'message';
      const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trim()).join('\n');
      if (!data || data === '[DONE]') return;
      let chunk;
      try { chunk = JSON.parse(data); } catch { return; }
      if (eventName === 'error' || chunk.error) throw new Error(chunk.code || 'AI stream failed');
      if (eventName === 'status') { setProgress(chunk.stage); return; }
      if (eventName === 'sources') { research = chunk; return; }
      const delta = chunk?.choices?.[0]?.delta?.content;
      if (typeof delta !== 'string' || !delta) return;
      if (!assistantRow) {
        hideTypingIndicator();
        assistantRow = appendMessage('ai', '');
      }
      fullText += delta;
      updateAssistantMessage(assistantRow, fullText);
      scrollToBottom();
    }

    while (true) {
      const { value, done } = await reader.read();
      if (version !== requestVersion) { await reader.cancel(); return ''; }
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';

      for (const event of events) processEvent(event);

      if (done) break;
    }
    if (buffer.trim()) processEvent(buffer);

    hideTypingIndicator();
    if (!assistantRow) {
      fullText = i18n ? i18n.t('chatNoResponse') : 'I could not generate a response. Please try again.';
      assistantRow = appendMessage('ai', fullText);
    }

    appendCheckedSources(assistantRow, research);
    persistSession();
    return fullText;
  }

  async function handleUserSubmit(userText) {
    if (!userText || !userText.trim() || isTyping) return;
    const text = userText.trim();
    appendMessage('user', text);
    persistSession();
    if (chatInput) {
      chatInput.value = '';
      resizeChatInput();
    }
    showTypingIndicator();
    requestController = new AbortController();
    const version = ++requestVersion;

    try {
      await requestAssistantReply(version);
    } catch (error) {
      if (version !== requestVersion || error.name === 'AbortError') return;
      hideTypingIndicator();
      const fallback = i18n
        ? i18n.t('chatGatewayError')
        : 'I’m Zhyanawa AI. I can’t connect to the AI service right now. Please try again in a moment.';
      appendMessage('ai', fallback);
      persistSession();
      showToast(i18n ? i18n.t('chatGatewayErrorToast') : 'AI connection error');
      console.error('Zhyanawa AI request failed:', error);
    } finally {
      if (version === requestVersion) {
        isTyping = false;
        requestController = null;
        if (sendBtn) sendBtn.disabled = false;
        hideTypingIndicator();
      }
    }
  }

  // =========================================================================
  // 3. Suggestion Cards Interaction (IMG-20261007-WA0037.jpg)
  // =========================================================================

  document.querySelectorAll('.suggestion-card').forEach((card) => {
    card.addEventListener('click', () => {
      const topic = card.dataset.topic;
      const promptKeys = {
        breathing: 'chatPrompt1',
        reframe: 'chatPrompt2',
        mindfulness: 'chatPrompt3',
        stress: 'chatPrompt4'
      };
      const promptText = i18n ? i18n.t(promptKeys[topic]) : card.textContent.trim();
      handleUserSubmit(promptText);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });

  // =========================================================================
  // 4. Sidebar History Management & "+ New Chat"
  // =========================================================================

  if (btnNewChat) {
    btnNewChat.addEventListener('click', () => {
      showWelcomeState();
      setSidebarOpen(false);
      showToast('Started new conversation');
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', async () => {
      const question = accountUser
        ? 'Permanently clear all chat history saved to your account?'
        : 'Clear all recent chat history from this device?';
      if (!confirm(question)) return;
      if (accountUser) {
        try {
          const response = await fetch(`${API_BASE}/api/chat/sessions`, { method: 'DELETE', credentials: 'include' });
          if (!response.ok) throw new Error('Unable to clear saved history.');
        } catch (error) {
          showToast(error.message);
          return;
        }
      } else {
        sessionStorage.removeItem('zhyanawa-chat-sessions');
      }
      sessions = [];
      showWelcomeState();
      showToast('Chat history cleared');
    });
  }

  // =========================================================================
  // 5. Message Action Buttons (Copy, Speak, Helpful)
  // =========================================================================

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-chat-action]');
    if (!btn) return;

    const action = btn.dataset.chatAction;
    const bubble = btn.closest('.message-bubble');
    if (!bubble) return;

    // Get message text without the action toolbar
    const clone = bubble.cloneNode(true);
    const actionsBar = clone.querySelector('.message-actions-bar');
    if (actionsBar) actionsBar.remove();
    const textContent = clone.innerText.trim();

    if (action === 'copy') {
      navigator.clipboard.writeText(textContent).then(() => {
        showToast('Copied to clipboard');
      }).catch(() => {
        showToast('Failed to copy');
      });
    } else if (action === 'speak') {
      if ('speechSynthesis' in window) {
        if (speechSynthActive) {
          window.speechSynthesis.cancel();
          speechSynthActive = false;
          btn.querySelector('span').textContent = 'Listen';
        } else {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textContent);
          utterance.rate = 0.95;
          utterance.pitch = 1.0;
          utterance.onend = () => {
            speechSynthActive = false;
            btn.querySelector('span').textContent = 'Listen';
          };
          window.speechSynthesis.speak(utterance);
          speechSynthActive = true;
          btn.querySelector('span').textContent = 'Stop';
        }
      } else {
        showToast('Audio playback not supported in this browser');
      }
    } else if (action === 'helpful') {
      btn.style.color = '#2e7d32';
      showToast('Thank you for your feedback');
    }
  });

  // =========================================================================
  // 6. Voice Input
  // =========================================================================

  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (!isRecording) {
        isRecording = true;
        micBtn.classList.add('is-recording');
        showToast('Listening... Speak now');

        // Check if browser SpeechRecognition is available
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
          const recognition = new SpeechRec();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = i18n?.language === 'ckb' ? 'ku' : (i18n?.language === 'ar' ? 'ar-IQ' : 'en-US');

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (chatInput) {
              chatInput.value = transcript;
              resizeChatInput();
            }
            isRecording = false;
            micBtn.classList.remove('is-recording');
            showToast('Voice transcribed');
          };

          recognition.onerror = () => {
            reportVoiceUnavailable();
          };

          try {
            recognition.start();
          } catch(err) {
            reportVoiceUnavailable();
          }
        } else {
          reportVoiceUnavailable();
        }
      } else {
        isRecording = false;
        micBtn.classList.remove('is-recording');
      }
    });
  }

  function reportVoiceUnavailable() {
    isRecording = false;
    micBtn.classList.remove('is-recording');
    const notices = { en: 'Voice input is unavailable. Please type your message.', ckb: 'نووسینەوەی دەنگ بەردەست نییە. تکایە پەیامەکەت بنووسە.', ar: 'الإدخال الصوتي غير متاح. يرجى كتابة رسالتك.' };
    showToast(notices[i18n?.language || 'en']);
  }

  // =========================================================================
  // 7. Input Submission Listeners
  // =========================================================================

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      if (chatInput) handleUserSubmit(chatInput.value);
    });
  }

  if (chatInput) {
    chatInput.addEventListener('input', resizeChatInput);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserSubmit(chatInput.value);
      }
    });
    resizeChatInput();
    updateComposerSpace();
  }

  // =========================================================================
  // 8. Navigation & Profile Modal
  // =========================================================================

  if (profileModal) {
    [btnProfileTrigger, sidebarProfileTrigger].filter(Boolean).forEach(trigger => trigger.addEventListener('click', () => {
      updateAccountUI();
      profileModal.classList.add('is-active');
      setSidebarOpen(false);
    }));
  }

  if (profileModalClose && profileModal) {
    profileModalClose.addEventListener('click', () => {
      profileModal.classList.remove('is-active');
    });
  }

  if (profileDoneButton && profileModal) {
    profileDoneButton.addEventListener('click', () => profileModal.classList.remove('is-active'));
  }

  if (profileExportButton) profileExportButton.addEventListener('click', () => window.print());

  function formatDoctorCodeDate(value) {
    const date = new Date(value);
    const language = i18n?.language || 'en';
    const locale = language === 'ckb' ? 'ckb-IQ' : (language === 'ar' ? 'ar-IQ' : 'en');
    return Number.isNaN(date.getTime()) ? 'Unknown' : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  async function loadDoctorCodes() {
    if (!doctorCodeList) return;
    if (!accountUser) {
      const empty = document.createElement('p');
      empty.className = 'doctor-code-empty';
      empty.textContent = doctorT('signIn');
      doctorCodeList.replaceChildren(empty);
      if (doctorCodeCreate) doctorCodeCreate.disabled = true;
      return;
    }
    if (doctorCodeCreate) doctorCodeCreate.disabled = false;
    const response = await fetch(`${API_BASE}/api/doctor-access/codes`, { credentials: 'include', cache: 'no-store' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(doctorT('loadFailed'));
    const codes = Array.isArray(payload.codes) ? payload.codes : [];
    if (!codes.length) {
      const empty = document.createElement('p');
      empty.className = 'doctor-code-empty';
      empty.textContent = doctorT('noCodes');
      doctorCodeList.replaceChildren(empty);
      return;
    }

    doctorCodeList.replaceChildren(...codes.map(code => {
      const item = document.createElement('article');
      item.className = 'doctor-code-item';
      const details = document.createElement('div');
      details.className = 'doctor-code-item-details';

      const title = document.createElement('strong');
      title.className = 'doctor-code-item-code';
      title.textContent = code.codeHint;

      const meta = document.createElement('small');
      meta.className = 'doctor-code-item-meta';
      const typeTag = document.createElement('span');
      typeTag.className = 'doctor-code-type-tag';
      typeTag.textContent = doctorT(code.accessType === 'one_time' ? 'oneShort' : 'lifetimeShort');
      const statusTag = document.createElement('span');
      statusTag.className = `doctor-code-status-tag status-${code.status}`;
      statusTag.textContent = doctorT(code.status);
      const countText = code.accessCount ? ` · ${doctorT('viewed')} ${code.accessCount}` : '';
      meta.append(typeTag, document.createTextNode(' · '), statusTag, document.createTextNode(` · ${doctorT('created')} ${formatDoctorCodeDate(code.createdAt)}${countText}`));

      details.append(title, meta);
      item.appendChild(details);
      if (code.status === 'active') {
        const revoke = document.createElement('button');
        revoke.type = 'button';
        revoke.className = 'doctor-code-revoke-btn';
        revoke.textContent = doctorT('revoke');
        revoke.addEventListener('click', async () => {
          if (!confirm(doctorT('revokeConfirm'))) return;
          revoke.disabled = true;
          try {
            const result = await fetch(`${API_BASE}/api/doctor-access/codes/${code.id}`, { method: 'DELETE', credentials: 'include' });
            if (!result.ok) throw new Error(doctorT('revokeFailed'));
            await loadDoctorCodes();
            showToast(doctorT('revokedToast'));
          } catch (error) {
            showToast(error.message);
            revoke.disabled = false;
          }
        });
        item.appendChild(revoke);
      }
      return item;
    }));
  }

  if (btnDoctorCodeTrigger && doctorCodeModal) {
    btnDoctorCodeTrigger.addEventListener('click', () => {
      doctorCodeError.textContent = '';
      doctorCodeResult.hidden = true;
      doctorCodeModal.classList.add('is-active');
      loadDoctorCodes().catch(error => { doctorCodeError.textContent = error.message; });
    });
  }
  doctorCodeClose?.addEventListener('click', () => doctorCodeModal?.classList.remove('is-active'));
  doctorCodeModal?.addEventListener('click', event => {
    if (event.target === doctorCodeModal) doctorCodeModal.classList.remove('is-active');
  });
  doctorCodeRefresh?.addEventListener('click', () => loadDoctorCodes().catch(error => { doctorCodeError.textContent = error.message; }));
  doctorCodeCopy?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(doctorCodeValue.textContent); showToast(doctorT('copied')); }
    catch { showToast(doctorT('copyFailed')); }
  });
  doctorCodeCreate?.addEventListener('click', async () => {
    doctorCodeError.textContent = '';
    doctorCodeResult.hidden = true;
    doctorCodeCreate.disabled = true;
    try {
      await persistenceQueue;
      const accessType = document.querySelector('input[name="doctor-access-type"]:checked')?.value || 'one_time';
      const response = await fetch(`${API_BASE}/api/doctor-access/codes`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessType })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error?.message || doctorT('createFailed'));
      doctorCodeValue.textContent = payload.code;
      doctorCodeResult.hidden = false;
      await loadDoctorCodes();
    } catch (error) {
      doctorCodeError.textContent = error.message;
    } finally {
      doctorCodeCreate.disabled = !accountUser;
    }
  });

  if (profileModal) {
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) profileModal.classList.remove('is-active');
    });
  }

  if (btnLogoutTrigger) {
    btnLogoutTrigger.addEventListener('click', async () => {
      if (confirm('Are you sure you want to exit your confidential session?')) {
        if (accountUser) {
          try { await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' }); } catch { /* Redirect still signs out locally. */ }
        } else {
          sessionStorage.clear();
        }
        window.location.href = '/';
      }
    });
  }

  // Sidebar flexible positioning & toggle
  const chatWorkspace = document.getElementById('chat-workspace') || document.querySelector('.chat-workspace');
  const btnDockSide = document.getElementById('btn-dock-side');
  const sidebarCloseBtn = document.getElementById('sidebar-close-btn');

  // Restore dock side preference (left vs right)
  const savedDock = localStorage.getItem('zhyanawa-sidebar-dock');
  if (savedDock === 'opposite' && chatWorkspace) {
    chatWorkspace.classList.add('dock-opposite');
  }

  // Restore collapsed state on wide screens if user previously collapsed it
  const savedCollapsed = localStorage.getItem('zhyanawa-sidebar-collapsed');
  if (savedCollapsed === 'true' && chatWorkspace && window.innerWidth > 860) {
    chatWorkspace.classList.add('sidebar-collapsed');
    sidebarToggle?.setAttribute('aria-expanded', 'false');
  } else {
    sidebarToggle?.setAttribute('aria-expanded', 'true');
  }

  function setSidebarOpen(isOpen) {
    if (!sidebar || !sidebarToggle) return;
    sidebar.classList.toggle('is-open', isOpen);
    sidebarToggle.setAttribute('aria-expanded', String(isOpen));
  }

  function toggleSidebar() {
    if (!sidebar) return;
    if (window.innerWidth <= 860) {
      setSidebarOpen(!sidebar.classList.contains('is-open'));
    } else if (chatWorkspace) {
      const isCollapsed = chatWorkspace.classList.toggle('sidebar-collapsed');
      localStorage.setItem('zhyanawa-sidebar-collapsed', String(isCollapsed));
      sidebarToggle?.setAttribute('aria-expanded', String(!isCollapsed));
    }
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', toggleSidebar);
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', () => {
      if (window.innerWidth <= 860) {
        setSidebarOpen(false);
      } else if (chatWorkspace) {
        chatWorkspace.classList.add('sidebar-collapsed');
        localStorage.setItem('zhyanawa-sidebar-collapsed', 'true');
        sidebarToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (btnDockSide && chatWorkspace) {
    btnDockSide.addEventListener('click', () => {
      const isOpposite = chatWorkspace.classList.toggle('dock-opposite');
      localStorage.setItem('zhyanawa-sidebar-dock', isOpposite ? 'opposite' : 'default');
      const isRtl = document.documentElement.dir === 'rtl';
      let msg = '';
      if (isRtl) {
        msg = isOpposite
          ? (i18n?.language === 'ar' ? 'تم نقل الشريط الجانبي إلى اليسار' : 'شریتی تەنیشت گوازرایەوە بۆ لای چەپ')
          : (i18n?.language === 'ar' ? 'تمت إعادة الشريط الجانبي إلى اليمين' : 'شریتی تەنیشت گەڕایەوە لای دەستە ڕاست');
      } else {
        msg = isOpposite ? 'Sidebar moved to the right' : 'Sidebar returned to the left';
      }
      showToast(msg);
    });
  }

  sidebarScrim?.addEventListener('click', () => setSidebarOpen(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setSidebarOpen(false);
      doctorCodeModal?.classList.remove('is-active');
    }
  });

  // =========================================================================
  // 9. Language Dropdown in Chat App
  // =========================================================================

  if (langTrigger && langDropdown) {
    langTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('is-open');
    });

    document.querySelectorAll('.chat-lang-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const lang = opt.dataset.lang;
        if (lang && i18n) {
          languageMode = 'selected';
          i18n.applyLanguage(lang);
          updateChatLanguageUI(lang);
          updateAccountUI();
          if (btnDoctorCodeTrigger) btnDoctorCodeTrigger.setAttribute('aria-label', i18n?.t('chatNavDoctorCode') || 'Doctor Code');
          if (doctorCodeModal?.classList.contains('is-active')) {
            loadDoctorCodes().catch(() => {});
          }
        }
        langDropdown.classList.remove('is-open');
      });
    });
  }

  function updateChatLanguageUI(lang) {
    if (langCodeSpan) {
      langCodeSpan.textContent = lang === 'ckb' ? 'KU' : lang.toUpperCase();
    }
    document.querySelectorAll('.chat-lang-option').forEach((opt) => {
      opt.classList.toggle('is-selected', opt.dataset.lang === lang);
    });
  }

  document.addEventListener('click', (e) => {
    if (langDropdown && !langDropdown.contains(e.target)) {
      langDropdown.classList.remove('is-open');
    }
  });

  // =========================================================================
  // 10. Toast Notification Helper
  // =========================================================================

  function showToast(msg) {
    if (!toast) return;
    const textSpan = toast.querySelector('span');
    if (textSpan) textSpan.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2800);
  }

  function handleAuthArrival() {
    const url = new URL(window.location.href);
    const result = url.searchParams.get('auth');
    if (!result) return;

    if (result === 'google-success' && accountUser) {
      const welcome = {
        en: `Welcome, ${accountUser.name}. Your conversations will be saved.`,
        ckb: `بەخێربێیت، ${accountUser.name}. گفتوگۆکانت پاشەکەوت دەکرێن.`,
        ar: `مرحباً، ${accountUser.name}. سيتم حفظ محادثاتك.`
      };
      showToast(welcome[i18n?.language || 'en']);
    }

    url.searchParams.delete('auth');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  // =========================================================================
  // 11. Initial Language Boot
  // =========================================================================

  if (i18n) {
    const activeLang = i18n.language || 'en';
    i18n.applyLanguage(activeLang);
    updateChatLanguageUI(activeLang);
  }
  if (btnProfileTrigger) btnProfileTrigger.setAttribute('aria-label', i18n?.t('chatNavProfile') || 'Profile');
  if (btnDoctorCodeTrigger) btnDoctorCodeTrigger.setAttribute('aria-label', i18n?.t('chatNavDoctorCode') || 'Doctor Code');
  if (btnLogoutTrigger) btnLogoutTrigger.setAttribute('aria-label', i18n?.t('chatNavLogout') || 'Log out');
  initializeChatIdentity().finally(() => {
    handleAuthArrival();
    chatInput?.focus({ preventScroll: true });
  });
});
