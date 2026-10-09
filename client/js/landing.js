/**
 * ZHYANAWA AI — Landing Page Interactions & Behavioral Logic
 * Connects the authentic company interface with i18n localization,
 * auth/anonymous access modals, wellness interactive toolkit, and contact handling.
 */

document.addEventListener('DOMContentLoaded', () => {
  const i18n = window.zhyanawaI18n;

  // --- Element References ---
  const header = document.getElementById('site-header');
  const langDropdown = document.getElementById('language-switcher');
  const langTrigger = document.getElementById('language-trigger');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  // Modals
  const authModal = document.getElementById('auth-modal');
  const profileModal = document.createElement('div');
  profileModal.className = 'modal-overlay account-modal';
  profileModal.setAttribute('role', 'dialog');
  profileModal.setAttribute('aria-modal', 'true');
  profileModal.setAttribute('aria-labelledby', 'account-modal-title');
  profileModal.innerHTML = `<div class="modal-dialog account-dialog">
    <button class="modal-close-btn" type="button" data-close-profile aria-label="Close">×</button>
    <div class="account-identity"><div class="account-avatar" id="account-avatar"></div><div><p class="account-eyebrow" data-i18n="profileAccount">YOUR ACCOUNT</p><h2 id="account-modal-title"></h2><p id="account-modal-email"></p></div></div>
    <div class="account-details"><div><span data-i18n="profileSignInMethod">Sign-in method</span><strong id="account-provider"></strong></div><div><span data-i18n="profileMemberSince">Member since</span><strong id="account-created"></strong></div></div>
    <div class="account-links"><a class="btn btn-primary" href="/chat" data-i18n="profileOpenChat">Open my chats</a><button class="btn btn-outline" type="button" data-action="logout" data-i18n="chatNavLogout">Log out</button></div>
    <p class="account-privacy" data-i18n="profilePrivacy">Your saved chats are private to your account. Share a doctor summary only by creating a code in chat.</p>
  </div>`;
  document.body.appendChild(profileModal);
  const authCloseBtn = document.getElementById('auth-modal-close') || document.getElementById('modal-close');
  const authForm = document.getElementById('auth-form');
  const loginForm = document.getElementById('form-login');
  const signupForm = document.getElementById('form-signup');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const groupFullName = document.getElementById('group-fullname');
  const groupConfirmPass = document.getElementById('group-confirm-pass');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const btnGuestEnter = document.getElementById('btn-guest-enter')
    || document.getElementById('btn-launch-guest')
    || document.getElementById('guest-access-btn');

  const wellnessModal = document.getElementById('wellness-modal');
  const wellnessCloseBtn = document.getElementById('wellness-modal-close');
  const tabBreathingPill = document.getElementById('tab-breathing-pill');
  const tabMoodPill = document.getElementById('tab-mood-pill');
  const viewBreathing = document.getElementById('wellness-breathing-view');
  const viewMood = document.getElementById('wellness-mood-view');

  // Breathing Orb Elements
  const breathOrb = document.getElementById('modal-breath-orb');
  const breathPhase = document.getElementById('modal-breath-phase');
  const breathCounter = document.getElementById('modal-breath-counter');
  const breathToggleBtn = document.getElementById('modal-breath-toggle');

  // Mood Elements
  const moodButtons = document.querySelectorAll('.mood-face-btn');
  const moodRecText = document.getElementById('modal-mood-rec-text');

  // Contact & Toast
  const contactForm = document.getElementById('contact-form');
  const toast = document.getElementById('toast');

  // State
  let currentAuthMode = 'login'; // 'login' | 'signup'
  let isBreathing = false;
  let breathTimer = null;
  let breathElapsed = 0;
  let currentMoodIndex = 0;
  let toastTimer = null;
  let currentUser = null;
  let googleLoginEnabled = null;
  const chatDashboardUrl = '/chat';

  const moodRecKeys = ['recCalm', 'recUneasy', 'recStressed', 'recOverwhelmed', 'recCrisis'];

  // =========================================================================
  // 1. Header & Navigation Behaviors
  // =========================================================================
  function updateHeaderOnScroll() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    }
  }
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();

  // Language Dropdown Toggle
  if (langTrigger && langDropdown) {
    langTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = langDropdown.classList.toggle('is-open');
      langTrigger.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.lang-option-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetLang = btn.dataset.lang;
        if (targetLang && i18n) {
          i18n.applyLanguage(targetLang);
          updateLanguageUI(targetLang);
          renderAccountNavigation();
        }
        langDropdown.classList.remove('is-open');
        langTrigger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function updateLanguageUI(lang) {
    const shortLabel = document.querySelector('[data-lang-short]');
    if (shortLabel) {
      shortLabel.textContent = lang === 'ckb' ? 'KU' : lang.toUpperCase();
    }
    document.querySelectorAll('.lang-option-btn').forEach((btn) => {
      const isSelected = btn.dataset.lang === lang;
      btn.classList.toggle('is-selected', isSelected);
      btn.setAttribute('aria-selected', String(isSelected));
    });
  }

  // Mobile Drawer Toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('drawer-open', isOpen);
    });

    mobileDrawer.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('drawer-open');
      });
    });
  }

  // Close menus on outside click or Escape
  document.addEventListener('click', (e) => {
    if (langDropdown && !langDropdown.contains(e.target)) {
      langDropdown.classList.remove('is-open');
      if (langTrigger) langTrigger.setAttribute('aria-expanded', 'false');
    }
    if (mobileDrawer && mobileToggle && !mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
      if (mobileDrawer.classList.contains('is-open')) {
        mobileDrawer.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('drawer-open');
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (langDropdown) {
        langDropdown.classList.remove('is-open');
        if (langTrigger) langTrigger.setAttribute('aria-expanded', 'false');
      }
      if (mobileDrawer) {
        mobileDrawer.classList.remove('is-open');
        if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
      }
      closeModal(authModal);
      closeModal(profileModal);
      closeModal(wellnessModal);
    }
  });

  // =========================================================================
  // 2. Toast System
  // =========================================================================
  function showToast(messageOrKey) {
    if (!toast) return;
    const textSpan = toast.querySelector('span');
    const localizedText = i18n ? i18n.t(messageOrKey) : messageOrKey;
    textSpan.textContent = localizedText || messageOrKey;

    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3600);
  }

  // Listen to any elements with [data-toast]
  document.querySelectorAll('[data-toast]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const toastKey = el.dataset.toast;
      if (toastKey) {
        e.preventDefault();
        showToast(toastKey);
      }
    });
  });

  // =========================================================================
  // 3. Modal Management (Auth & Wellness)
  // =========================================================================
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('is-active');
    document.body.style.overflow = '';
    if (modalEl === wellnessModal && isBreathing) {
      stopBreathing();
    }
  }

  // Backdrop clicks close modal
  [authModal, wellnessModal, profileModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  if (authCloseBtn) authCloseBtn.addEventListener('click', () => closeModal(authModal));
  profileModal.querySelector('[data-close-profile]').addEventListener('click', () => closeModal(profileModal));
  if (wellnessCloseBtn) wellnessCloseBtn.addEventListener('click', () => closeModal(wellnessModal));

  // Global triggers for opening modals
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-action]');
    if (!trigger) return;

    const action = trigger.dataset.action;

    if (action === 'open-auth') {
      e.preventDefault();
      if (currentUser) {
        window.location.assign(chatDashboardUrl);
        return;
      }
      const tabMode = trigger.dataset.authTab || 'login';
      setAuthMode(tabMode === 'signup' ? 'signup' : 'login');
      openModal(authModal);
    } else if (action === 'open-profile') {
      e.preventDefault();
      if (currentUser) openModal(profileModal);
    } else if (action === 'logout') {
      e.preventDefault();
      logoutUser();
    } else if (action === 'open-wellness') {
      e.preventDefault();
      const toolTab = trigger.dataset.wellnessTab || 'breathing';
      setWellnessTool(toolTab);
      openModal(wellnessModal);
    } else if (action === 'open-chat') {
      e.preventDefault();
      window.location.href = '/chat';
    } else if (action === 'open-emergency') {
      e.preventDefault();
      const emergencySec = document.getElementById('emergency');
      if (emergencySec && window.location.pathname.endsWith('/emergency')) {
        emergencySec.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = '/emergency';
      }
    }
  });

  // =========================================================================
  // 4. Auth Modal Logic (Login, Signup, Anonymous Guest)
  // =========================================================================
  function setAuthMode(mode) {
    currentAuthMode = mode;
    const isSignup = mode === 'signup';

    if (tabLogin) {
      tabLogin.classList.toggle('is-active', !isSignup);
      tabLogin.setAttribute('aria-selected', String(!isSignup));
    }
    if (tabSignup) {
      tabSignup.classList.toggle('is-active', isSignup);
      tabSignup.setAttribute('aria-selected', String(isSignup));
    }

    if (groupFullName) groupFullName.style.display = isSignup ? 'flex' : 'none';
    if (groupConfirmPass) groupConfirmPass.style.display = isSignup ? 'flex' : 'none';

    if (authSubmitBtn && i18n) {
      authSubmitBtn.textContent = i18n.t(isSignup ? 'tabCreateAccount' : 'tabLogin');
    }

    if (loginForm) loginForm.classList.toggle('is-active', !isSignup);
    if (signupForm) signupForm.classList.toggle('is-active', isSignup);
  }

  if (tabLogin) tabLogin.addEventListener('click', () => setAuthMode('login'));
  if (tabSignup) tabSignup.addEventListener('click', () => setAuthMode('signup'));

  async function requestAccount(path, payload) {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error?.message || 'Unable to complete this request.');
    return result;
  }

  function setSubmitting(form, isSubmitting) {
    if (!form) return;
    const button = form.querySelector('button[type="submit"]');
    if (!button) return;
    if (isSubmitting) button.dataset.readyLabel = button.textContent;
    button.disabled = isSubmitting;
    button.textContent = isSubmitting ? 'Please wait...' : (button.dataset.readyLabel || button.textContent);
  }

  function finishAuthentication(result, form) {
    currentUser = result.user;
    sessionStorage.removeItem('zhyanawa_guest_id');
    sessionStorage.setItem('zhyanawa_auth_mode', 'account');
    form.reset();
    window.location.replace(chatDashboardUrl);
  }

  async function submitUnifiedAuth(event) {
    event.preventDefault();
    if (!authForm.reportValidity()) return;
    const password = document.getElementById('auth-password')?.value || '';
    const confirmPassword = document.getElementById('auth-confirm-password')?.value || '';
    const name = document.getElementById('auth-fullname')?.value.trim() || '';
    if (currentAuthMode === 'signup' && name.length < 2) {
      showToast('Please enter your full name.');
      return;
    }
    if (currentAuthMode === 'signup' && password !== confirmPassword) {
      showToast('Passwords do not match.');
      return;
    }
    setSubmitting(authForm, true);
    try {
      const result = await requestAccount(`/api/auth/${currentAuthMode === 'signup' ? 'register' : 'login'}`, {
        name,
        email: document.getElementById('auth-email')?.value.trim() || '',
        password
      });
      finishAuthentication(result, authForm);
    } catch (error) {
      showToast(error.message);
    } finally {
      setSubmitting(authForm, false);
    }
  }

  async function submitLogin(event) {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;
    setSubmitting(loginForm, true);
    try {
      const result = await requestAccount('/api/auth/login', {
        email: document.getElementById('login-email')?.value.trim() || '',
        password: document.getElementById('login-password')?.value || ''
      });
      finishAuthentication(result, loginForm);
    } catch (error) {
      showToast(error.message);
    } finally {
      setSubmitting(loginForm, false);
    }
  }

  async function submitSignup(event) {
    event.preventDefault();
    if (!signupForm.reportValidity()) return;
    const password = document.getElementById('signup-password')?.value || '';
    if (password !== (document.getElementById('signup-confirm')?.value || '')) {
      showToast('Passwords do not match.');
      return;
    }
    setSubmitting(signupForm, true);
    try {
      const result = await requestAccount('/api/auth/register', {
        name: document.getElementById('signup-name')?.value.trim() || '',
        email: document.getElementById('signup-email')?.value.trim() || '',
        password
      });
      finishAuthentication(result, signupForm);
    } catch (error) {
      showToast(error.message);
    } finally {
      setSubmitting(signupForm, false);
    }
  }

  function renderAccountNavigation() {
    document.querySelectorAll('.nav-login-btn').forEach((button) => {
      if (currentUser) {
        button.removeAttribute('data-i18n');
        button.dataset.action = 'open-profile';
        button.removeAttribute('data-auth-tab');
        button.setAttribute('aria-label', `${i18n ? i18n.t('chatNavProfile') : 'Profile'}: ${currentUser.name}`);
        button.classList.add('nav-profile-btn');
        button.replaceChildren();
        const avatar = document.createElement('span');
        avatar.className = 'nav-profile-avatar';
        avatar.textContent = currentUser.name?.trim()?.[0]?.toUpperCase() || '?';
        const label = document.createElement('span');
        label.textContent = `${i18n ? i18n.t('chatNavProfile') : 'Profile'} · ${currentUser.name.split(/\s+/)[0] || currentUser.email}`;
        button.append(avatar, label);
      } else {
        button.classList.remove('nav-profile-btn');
        button.removeAttribute('aria-label');
        button.dataset.i18n = 'navLogin';
        button.dataset.action = 'open-auth';
        button.dataset.authTab = 'login';
        button.textContent = i18n ? i18n.t('navLogin') : 'Log In';
      }
    });
    document.querySelectorAll('.nav-signup-btn').forEach((button) => {
      if (currentUser) {
        button.dataset.i18n = 'chatNavLogout';
        button.dataset.action = 'logout';
        button.removeAttribute('data-auth-tab');
        button.textContent = i18n ? i18n.t('chatNavLogout') : 'Log out';
      } else {
        button.dataset.i18n = 'navSignup';
        button.dataset.action = 'open-auth';
        button.dataset.authTab = 'signup';
        button.textContent = i18n ? i18n.t('navSignup') : 'Sign Up';
      }
    });
    if (currentUser) {
      profileModal.querySelector('#account-avatar').textContent = currentUser.name?.trim()?.[0]?.toUpperCase() || '?';
      profileModal.querySelector('#account-modal-title').textContent = currentUser.name;
      profileModal.querySelector('#account-modal-email').textContent = currentUser.email;
      const provider = currentUser.provider === 'google' ? 'Google' : currentUser.provider === 'email + google' ? 'Email + Google' : 'Email';
      profileModal.querySelector('#account-provider').textContent = provider;
      const date = new Date(currentUser.createdAt);
      profileModal.querySelector('#account-created').textContent = Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(i18n?.language || 'en', { dateStyle: 'medium' }).format(date);
    }
  }

  async function loadAccountSession() {
    try {
      const response = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store', headers: { Accept: 'application/json' } });
      currentUser = response.ok ? (await response.json()).user : null;
    } catch {
      currentUser = null;
    }
    renderAccountNavigation();
  }

  async function logoutUser() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      currentUser = null;
      closeModal(profileModal);
      sessionStorage.removeItem('zhyanawa_auth_mode');
      renderAccountNavigation();
      showToast('You are now logged out.');
    }
  }

  function startGoogleLogin() {
    if (googleLoginEnabled === false) {
      showToast('authGoogleUnavailable');
      return;
    }
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  }

  function installGoogleLogin() {
    const panel = authModal?.querySelector('.auth-panel-registered');
    if (!panel || panel.querySelector('.google-auth-wide')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'google-auth-wrap';
    wrapper.innerHTML = '<span class="google-auth-divider" data-i18n="authOrSocial">Or continue with:</span><button class="google-auth-wide" type="button" data-google-auth disabled><span class="google-auth-mark" aria-hidden="true">G</span><span data-i18n="authContinueGoogle">Continue with Google</span></button><p class="google-auth-note" data-i18n="authGoogleUnavailable">Google sign-in is not configured yet.</p>';
    panel.appendChild(wrapper);
    wrapper.querySelector('button').addEventListener('click', startGoogleLogin);
    const legacySocialRow = panel.querySelector('.auth-social-row');
    if (legacySocialRow) legacySocialRow.hidden = true;
  }

  async function loadAuthProviders() {
    try {
      const response = await fetch('/api/auth/providers', { headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const providers = await response.json();
      googleLoginEnabled = Boolean(providers.google?.enabled);
      document.querySelectorAll('[data-google-auth]').forEach((button) => {
        button.disabled = !googleLoginEnabled;
        button.setAttribute('aria-disabled', String(!googleLoginEnabled));
      });
      document.querySelectorAll('.google-auth-note').forEach((note) => {
        note.hidden = googleLoginEnabled;
      });
    } catch {
      googleLoginEnabled = false;
      document.querySelectorAll('.google-auth-note').forEach(note => { note.hidden = false; });
    }
  }

  function handleAuthResult() {
    const url = new URL(window.location.href);
    const result = url.searchParams.get('auth');
    if (!result) return;
    const messages = {
      'google-success': 'You are signed in with Google.',
      'google-unavailable': 'authGoogleUnavailable',
      'google-cancelled': 'Google sign-in was cancelled.',
      'google-state-error': 'Google sign-in expired. Please try again.',
      'account-suspended': 'This account is suspended.',
      'google-error': 'Google sign-in could not be completed.'
    };
    showToast(messages[result] || 'Authentication could not be completed.');
    url.searchParams.delete('auth');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  if (authForm) authForm.addEventListener('submit', submitUnifiedAuth);
  if (loginForm) loginForm.addEventListener('submit', submitLogin);
  if (signupForm) signupForm.addEventListener('submit', submitSignup);
  document.querySelectorAll('[aria-label="Sign in with Google"]').forEach((button) => {
    button.addEventListener('click', startGoogleLogin);
  });
  installGoogleLogin();
  loadAuthProviders();
  handleAuthResult();
  loadAccountSession();

  // Continue as Anonymous Guest
  if (btnGuestEnter) {
    btnGuestEnter.addEventListener('click', () => {
      const guestId = 'guest_' + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem('zhyanawa_guest_id', guestId);
      sessionStorage.setItem('zhyanawa_auth_mode', 'anonymous');
      closeModal(authModal);
      showToast('toastGuestSuccess');
      setTimeout(() => {
        window.location.href = '/chat';
      }, 450);
    });
  }

  // =========================================================================
  // 5. Wellness Toolkit: 4-7-8 Breathing & Mood Check
  // =========================================================================
  function setWellnessTool(toolName) {
    const isBreathingTab = toolName === 'breathing';
    if (tabBreathingPill) tabBreathingPill.classList.toggle('is-active', isBreathingTab);
    if (tabMoodPill) tabMoodPill.classList.toggle('is-active', !isBreathingTab);

    if (viewBreathing) viewBreathing.style.display = isBreathingTab ? 'flex' : 'none';
    if (viewMood) viewMood.style.display = !isBreathingTab ? 'block' : 'none';
  }

  if (tabBreathingPill) tabBreathingPill.addEventListener('click', () => setWellnessTool('breathing'));
  if (tabMoodPill) tabMoodPill.addEventListener('click', () => setWellnessTool('mood'));

  // 4-7-8 Breathing Cycle
  function getBreathingState(seconds) {
    const cyclePosition = seconds % 19;
    if (cyclePosition < 4) {
      return { key: 'breathInhale', duration: 4, remaining: 4 - cyclePosition };
    } else if (cyclePosition < 11) {
      return { key: 'breathHold', duration: 7, remaining: 11 - cyclePosition };
    } else {
      return { key: 'breathExhale', duration: 8, remaining: 19 - cyclePosition };
    }
  }

  function updateBreathVisual() {
    const state = getBreathingState(breathElapsed);
    if (breathPhase && i18n) {
      breathPhase.textContent = i18n.t(state.key);
    }
    if (breathCounter) {
      breathCounter.textContent = (i18n && i18n.formatNumber) ? i18n.formatNumber(state.remaining) : state.remaining;
    }
  }

  function startBreathing() {
    isBreathing = true;
    breathElapsed = 0;
    if (breathOrb) breathOrb.classList.add('is-breathing');
    if (breathToggleBtn && i18n) {
      breathToggleBtn.querySelector('span').textContent = i18n.t('btnStopBreathing');
      breathToggleBtn.classList.add('btn-secondary');
      breathToggleBtn.classList.remove('btn-primary');
    }
    updateBreathVisual();

    clearInterval(breathTimer);
    breathTimer = setInterval(() => {
      breathElapsed += 1;
      updateBreathVisual();
    }, 1000);
  }

  function stopBreathing() {
    isBreathing = false;
    clearInterval(breathTimer);
    breathTimer = null;
    breathElapsed = 0;
    if (breathOrb) breathOrb.classList.remove('is-breathing');
    if (breathPhase && i18n) {
      breathPhase.textContent = i18n.t('breathReady');
    }
    if (breathCounter) {
      breathCounter.textContent = i18n ? i18n.t('breathCounterInit') : '4·7·8';
    }
    if (breathToggleBtn && i18n) {
      breathToggleBtn.querySelector('span').textContent = i18n.t('btnStartBreathing');
      breathToggleBtn.classList.remove('btn-secondary');
      breathToggleBtn.classList.add('btn-primary');
    }
  }

  if (breathToggleBtn) {
    breathToggleBtn.addEventListener('click', () => {
      if (isBreathing) {
        stopBreathing();
      } else {
        startBreathing();
      }
    });
  }

  // Mood Check Selection
  moodButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.moodIndex || '0', 10);
      currentMoodIndex = idx;
      moodButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const recKey = moodRecKeys[idx] || 'recCalm';
      if (moodRecText && i18n) {
        moodRecText.textContent = i18n.t(recKey);
      }
    });
  });

  // =========================================================================
  // 6. Contact Form Submission
  // =========================================================================
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('.form-submit-btn');
      const originalText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '...';
      }

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: document.getElementById('contact-name')?.value || '',
            email: document.getElementById('contact-email')?.value || '',
            subject: document.getElementById('contact-subject')?.value || '',
            message: document.getElementById('contact-message')?.value || ''
          })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error?.message || 'Unable to send your message.');
        contactForm.reset();
        showToast('formSuccessMsg');
      } catch (error) {
        showToast(error.message || 'Unable to send your message. Please try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  // =========================================================================
  // 7. Accessible Service Cards Keyboard Activation
  // =========================================================================
  document.querySelectorAll('.mockup-service-card[tabindex="0"]').forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // =========================================================================
  // 8. Dynamic Language Change Listener
  // =========================================================================
  document.addEventListener('languagechange', () => {
    updateLanguageUI(i18n.language);
    setAuthMode(currentAuthMode);
    if (!isBreathing) {
      if (breathPhase) breathPhase.textContent = i18n.t('breathReady');
      if (breathCounter) breathCounter.textContent = i18n.t('breathCounterInit');
      if (breathToggleBtn) breathToggleBtn.querySelector('span').textContent = i18n.t('btnStartBreathing');
    } else {
      updateBreathVisual();
      if (breathToggleBtn) breathToggleBtn.querySelector('span').textContent = i18n.t('btnStopBreathing');
    }
    const recKey = moodRecKeys[currentMoodIndex] || 'recCalm';
    if (moodRecText) moodRecText.textContent = i18n.t(recKey);
  });

  // Automatically update annual copyright year
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('.auto-year').forEach((el) => {
    el.textContent = String(currentYear);
  });

  // Initial language setup
  if (i18n) {
    i18n.applyLanguage(i18n.language || 'en');
    updateLanguageUI(i18n.language || 'en');
  }
});
