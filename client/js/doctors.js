'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('doctors-cards-grid');
  if (!grid) return;

  const locationLabels = {
    'city-center': 'filterLocationCenter',
    'ibrahim-pasha': 'filterLocationPasha',
    baranan: 'filterLocationBaranan'
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function translate(key, fallback) {
    return window.zhyanawaI18n ? window.zhyanawaI18n.t(key) : fallback;
  }

  function phoneHref(phone) {
    return String(phone || '').replace(/[^\d+]/g, '');
  }

  function doctorCard(doctor) {
    const searchTerms = [doctor.name, doctor.title, doctor.clinic, doctor.location, ...(doctor.specialties || [])].join(' ').toLowerCase();
    const specialtyKey = 'badgePsychiatrist';
    const specialtyFallback = 'Psychiatrist';
    const imagePath = doctor.imagePath || 'assets/zhyanawa-logo-symbol.png';
    const phones = (doctor.phones || []).slice(0, 2).map(phone => `<a href="tel:${escapeHtml(phoneHref(phone))}" class="doctor-phone-link" dir="ltr">${escapeHtml(phone)}</a>`).join('');
    const primaryPhone = doctor.phones[0] || '';
    const direction = doctor.mapUrl
      ? `<a href="${escapeHtml(doctor.mapUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline doctor-cta-dir">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          <span>${escapeHtml(translate('btnGetDirections', 'Get Directions'))}</span>
        </a>` : '';
    return `<article class="doctor-card" data-location="${escapeHtml(doctor.location)}" data-specialties="${escapeHtml((doctor.specialties || []).join(','))}" data-search-terms="${escapeHtml(searchTerms)}">
      <div class="doctor-card-header">
        <div class="doctor-avatar-wrap">
          <img src="${escapeHtml(imagePath)}" alt="${escapeHtml(doctor.name)}" class="doctor-avatar-img" loading="lazy">
        </div>
        <div class="doctor-header-info">
          <h3 class="doctor-name">${escapeHtml(doctor.name)}</h3>
          <p class="doctor-spec-title">${escapeHtml(doctor.title)}</p>
          <div class="doctor-tags-row">
            <span class="doctor-badge">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${escapeHtml(translate(locationLabels[doctor.location], doctor.location.replace(/-/g, ' ')))}</span>
            </span>
            <span class="doctor-badge">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
              <span>${escapeHtml(translate(specialtyKey, specialtyFallback))}</span>
            </span>
          </div>
        </div>
      </div>
      <div class="doctor-card-body">
        <div class="doctor-clinic-item">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M12 7v6"/><path d="M9 10h6"/></svg>
          <span>${escapeHtml(doctor.clinic)}</span>
        </div>
        <div class="doctor-phones-item">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1.01A11.36 11.36 0 0 1 8.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
          <div class="doctor-phones-links">${phones}</div>
        </div>
      </div>
      <div class="doctor-card-footer">
        <a href="tel:${escapeHtml(phoneHref(primaryPhone))}" class="btn btn-primary doctor-cta-call">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1.01A11.36 11.36 0 0 1 8.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z"/></svg>
          <span>${escapeHtml(translate('btnCallClinic', 'Call Clinic'))}</span>
        </a>
        ${direction}
      </div>
    </article>`;
  }

  async function loadDoctors() {
    const language = document.documentElement.lang || 'en';
    const response = await fetch(`/api/doctors?lang=${encodeURIComponent(language)}`);
    if (!response.ok) throw new Error('Doctor directory is unavailable.');
    const payload = await response.json();
    grid.querySelectorAll('.doctor-card').forEach(card => card.remove());
    const emptyState = document.getElementById('doctors-empty-state');
    const markup = (payload.doctors || []).map(doctorCard).join('');
    if (emptyState) emptyState.insertAdjacentHTML('beforebegin', markup);
    else grid.insertAdjacentHTML('beforeend', markup);
    grid.querySelectorAll('.doctor-avatar-img').forEach(image => {
      image.addEventListener('error', () => { image.src = 'assets/zhyanawa-logo-symbol.png'; }, { once: true });
    });
    if (typeof window.refreshDoctorDirectory === 'function') window.refreshDoctorDirectory();
  }

  loadDoctors().catch(() => { /* Keep the server-rendered directory as an offline fallback. */ });
  document.addEventListener('languagechange', () => loadDoctors().catch(() => {}));
});
