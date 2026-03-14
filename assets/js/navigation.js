document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  const dropdowns = document.querySelectorAll(".nav-dropdown");
  let hoverTimeout;

  // Create hamburger menu button
  const hamburger = document.createElement("button");
  hamburger.className = "hamburger-menu";
  hamburger.setAttribute("aria-label", "Toggle navigation menu");
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  const header = document.querySelector(".header-inner");
  if (header) {
    header.insertBefore(hamburger, nav);
  }

  function closeAllDropdowns() {
    dropdowns.forEach((drop) => {
      drop.classList.remove("open");
    });
  }

  function openDropdown(drop) {
    closeAllDropdowns();
    drop.classList.add("open");
  }

  function toggleNav() {
    nav.classList.toggle("mobile-open");
    hamburger.setAttribute("aria-expanded", nav.classList.contains("mobile-open"));
  }

  // Hamburger menu click handler
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleNav();
  });

  // Close nav when clicking on a link
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("mobile-open");
      hamburger.setAttribute("aria-expanded", "false");
      closeAllDropdowns();
    });
  });

  dropdowns.forEach((drop) => {
    const button = drop.querySelector(".dropdown-toggle");
    const menu = drop.querySelector(".dropdown-menu");
    
    if (!button) return;

    // Click to toggle on mobile/small screens
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = drop.classList.contains("open");

      if (!isOpen) {
        closeAllDropdowns();
        openDropdown(drop);
      } else {
        closeAllDropdowns();
      }
    });

    // Hover to open on desktop (only if not mobile)
    drop.addEventListener("mouseenter", () => {
      if (window.innerWidth > 640) {
        clearTimeout(hoverTimeout);
        openDropdown(drop);
      }
    });

    drop.addEventListener("mouseleave", () => {
      if (window.innerWidth > 640) {
        hoverTimeout = setTimeout(() => {
          closeAllDropdowns();
        }, 150);
      }
    });

    // Close when menu item is clicked
    if (menu) {
      menu.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllDropdowns();
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    const isClickInsideDropdown = Array.from(dropdowns).some(drop => 
      drop.contains(e.target)
    );
    
    if (!isClickInsideDropdown) {
      closeAllDropdowns();
    }
  });

  // Close mobile nav when clicking outside
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove("mobile-open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });

  // Close dropdowns with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDropdowns();
      nav.classList.remove("mobile-open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
});