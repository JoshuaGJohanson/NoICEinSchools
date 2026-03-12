document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll(".nav-dropdown");

  function closeAllDropdowns() {
    dropdowns.forEach((drop) => {
      drop.classList.remove("open");
    });
  }

  dropdowns.forEach((drop) => {
    const button = drop.querySelector(".dropdown-toggle");
    const menu = drop.querySelector(".dropdown-menu");
    
    if (!button) return;

    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = drop.classList.contains("open");

      closeAllDropdowns();

      if (!isOpen) {
        drop.classList.add("open");
      }
    });

    if (menu) {
      menu.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllDropdowns();
      });
    }
  });

  document.addEventListener("click", (e) => {
    const isClickInsideDropdown = Array.from(dropdowns).some(drop => 
      drop.contains(e.target)
    );
    
    if (!isClickInsideDropdown) {
      closeAllDropdowns();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllDropdowns();
    }
  });
});