'use strict';

document.addEventListener("DOMContentLoaded", function() {
      const tabButtons = document.querySelectorAll(".legal-tab-btn");
      const legalCards = document.querySelectorAll(".legal-card");

      tabButtons.forEach(button => {
        button.addEventListener("click", () => {
          const target = button.getAttribute("data-tab-target");

          tabButtons.forEach(btn => {
            btn.classList.remove("is-active");
            btn.setAttribute("aria-selected", "false");
          });
          button.classList.add("is-active");
          button.setAttribute("aria-selected", "true");

          legalCards.forEach(card => {
            const category = card.getAttribute("data-category");
            if (target === "all" || category === target) {
              card.classList.remove("is-hidden");
            } else {
              card.classList.add("is-hidden");
            }
          });
        });
      });
    });
