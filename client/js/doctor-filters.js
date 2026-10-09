'use strict';

// Real-time Doctor Filtering & Search Logic
    (function initDoctorDirectory() {
      const searchInput = document.getElementById('doctor-search-input');
      const searchClear = document.getElementById('doctor-search-clear');
      const filterPills = document.querySelectorAll('.filter-pill');
      let cards = Array.from(document.querySelectorAll('.doctor-card'));
      const counterEl = document.getElementById('doctor-results-counter');
      const emptyState = document.getElementById('doctors-empty-state');
      const resetBtn = document.getElementById('btn-reset-filters');

      let activeLocation = 'all';
      let searchQuery = '';

      window.refreshDoctorDirectory = function refreshDoctorDirectory() {
        cards = Array.from(document.querySelectorAll('.doctor-card'));
        applyFilters();
      };

      function updateCounter(visibleCount) {
        if (!counterEl) return;
        const i18nObj = window.zhyanawaI18n;
        const rawT = (i18nObj && typeof i18nObj.t === 'function')
          ? i18nObj.t('showingDoctorsCount')
          : 'Showing {count} verified specialists in Sulaymaniyah';
        const numStr = (i18nObj && typeof i18nObj.formatNumber === 'function')
          ? i18nObj.formatNumber(visibleCount)
          : visibleCount;
        counterEl.textContent = rawT.replace('{count}', numStr);
      }

      function applyFilters() {
        let visibleCount = 0;
        const queryNorm = searchQuery.trim().toLowerCase();

        cards.forEach((card) => {
          const cardLoc = card.dataset.location || '';
          const searchTerms = (card.dataset.searchTerms || '').toLowerCase();

          const matchesLoc = (activeLocation === 'all') || (cardLoc === activeLocation);
          const matchesSearch = !queryNorm || searchTerms.includes(queryNorm);

          if (matchesLoc && matchesSearch) {
            card.style.display = 'flex';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });

        if (emptyState) {
          emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        updateCounter(visibleCount);
      }

      // Filter pills clicking
      filterPills.forEach((pill) => {
        pill.addEventListener('click', () => {
          const fType = pill.dataset.filterType;
          const fVal = pill.dataset.filterVal;

          // Toggle active class in group
          pill.closest('.filter-pills').querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('is-active'));
          pill.classList.add('is-active');

          if (fType === 'location') activeLocation = fVal;

          applyFilters();
        });
      });

      // Search input typing
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          if (searchClear) searchClear.style.display = searchQuery ? 'block' : 'none';
          applyFilters();
        });
      }

      if (searchClear) {
        searchClear.addEventListener('click', () => {
          searchInput.value = '';
          searchQuery = '';
          searchClear.style.display = 'none';
          searchInput.focus();
          applyFilters();
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeLocation = 'all';
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          if (searchClear) searchClear.style.display = 'none';

          document.querySelectorAll('.filter-pill').forEach((p) => {
            if (p.dataset.filterVal === 'all') p.classList.add('is-active');
            else p.classList.remove('is-active');
          });

          applyFilters();
        });
      }

      // Re-apply counter text on language switch
      document.addEventListener('languagechange', () => {
        applyFilters();
      });

      // Initial filter apply
      applyFilters();
    })();
