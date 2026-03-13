document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll(".nav-dropdown");
  let hoverTimeout;

  function closeAllDropdowns() {
    dropdowns.forEach((drop) => {
      drop.classList.remove("open");
    });
  }

  function openDropdown(drop) {
    closeAllDropdowns();
    drop.classList.add("open");
  }

  dropdowns.forEach((drop) => {
    const button = drop.querySelector(".dropdown-toggle");
    const menu = drop.querySelector(".dropdown-menu");
    
    if (!button) return;

    // Click to toggle on mobile/small screens
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = drop.classList.contains("open");
      closeAllDropdowns();

      if (!isOpen) {
        openDropdown(drop);
      }
    });

    // Hover to open on desktop
    drop.addEventListener("mouseenter", () => {
      clearTimeout(hoverTimeout);
      openDropdown(drop);
    });

    drop.addEventListener("mouseleave", () => {
      hoverTimeout = setTimeout(() => {
        closeAllDropdowns();
      }, 150);
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

  // Close dropdowns with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDropdowns();
    }
  });
});