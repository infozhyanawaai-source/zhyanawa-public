'use strict';

document.addEventListener("DOMContentLoaded", function() {
      // Pricing Horizon Tabs
      const filterButtons = document.querySelectorAll(".pricing-tab-btn");
      const pricingCards = document.querySelectorAll(".pricing-card");

      filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-pricing-filter");

          filterButtons.forEach(b => {
            b.classList.remove("is-active");
            b.setAttribute("aria-selected", "false");
          });
          btn.classList.add("is-active");
          btn.setAttribute("aria-selected", "true");

          pricingCards.forEach(card => {
            const cat = card.getAttribute("data-tier-category");
            if (target === "all" || cat === target) {
              card.classList.remove("is-hidden");
            } else {
              card.classList.add("is-hidden");
            }
          });
        });
      });

      // FAQ Accordion
      const faqItems = document.querySelectorAll(".pricing-faq-item");
      faqItems.forEach(item => {
        const questionBtn = item.querySelector(".pricing-faq-question");
        if (questionBtn) {
          questionBtn.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");
            // Optional: close other items or allow multiple open
            faqItems.forEach(i => {
              i.classList.remove("is-open");
              const b = i.querySelector(".pricing-faq-question");
              if (b) b.setAttribute("aria-expanded", "false");
            });
            if (!isOpen) {
              item.classList.add("is-open");
              questionBtn.setAttribute("aria-expanded", "true");
            }
          });
        }
      });
    });
