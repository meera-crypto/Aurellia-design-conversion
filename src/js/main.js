document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".slider").forEach((slider) => {
    const track = slider.querySelector(".slider__track");
    const prev = slider.querySelector(".slider-nav--prev");
    const next = slider.querySelector(".slider-nav--next");

    if (!track) return;

    const getScrollAmount = () => {
      const item = track.querySelector(".slider__item");

      if (!item) return 300;

      const gap = parseFloat(getComputedStyle(track).gap) || 0;

      return item.offsetWidth + gap;
    };

    prev?.addEventListener("click", () => {
      track.scrollBy({
        left: -getScrollAmount(),
        behavior: "smooth",
      });
    });

    next?.addEventListener("click", () => {
      track.scrollBy({
        left: getScrollAmount(),
        behavior: "smooth",
      });
    });

    const updateArrows = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;

      prev?.classList.toggle("is-hidden", track.scrollLeft <= 1);
      next?.classList.toggle("is-hidden", track.scrollLeft >= maxScroll - 1);
    };

    track.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);

    updateArrows();
  });

  initMasterpieceCarousel();
  initHeaderSearch();
});

function initHeaderSearch() {
  const root = document.querySelector(".header-search");
  const toggle = root?.querySelector(".action-search");
  const input = root?.querySelector(".header-search-input");
  if (!root || !toggle || !input) return;

  const open = () => {
    root.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close search");
    input.focus();
  };

  const close = () => {
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open search");
  };

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    root.classList.contains("is-open") ? close() : open();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("is-open")) close();
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target) && root.classList.contains("is-open")) close();
  });
}

function initMasterpieceCarousel() {
  const root = document.querySelector(".masterpiece-carousel");
  if (!root) return;

  const stage = root.querySelector(".masterpiece-carousel-list");
  const cards = [...root.querySelectorAll(".masterpiece-carousel-item")];
  const prevBtn = root.querySelector(".slider-nav--prev");
  const nextBtn = root.querySelector(".slider-nav--next");
  const total = cards.length;
  if (!stage || !total) return;

  let active = 0;
  let animating = false;
  const stepX = 100;
  const mobileQuery = window.matchMedia("(max-width: 767px)");
  const isMobile = () => mobileQuery.matches;

  const lightbox = document.createElement("div");
  lightbox.className = "masterpiece-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-hidden", "true");

  const lightboxImg = document.createElement("img");
  lightboxImg.className = "masterpiece-lightbox__image";
  lightboxImg.alt = "";

  const lightboxClose = document.createElement("button");
  lightboxClose.type = "button";
  lightboxClose.className = "masterpiece-lightbox__close";
  lightboxClose.setAttribute("aria-label", "Close");
  lightboxClose.innerHTML = "&times;";

  lightbox.appendChild(lightboxClose);
  lightbox.appendChild(lightboxImg);
  document.body.appendChild(lightbox);

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "Masterpiece image";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function wrap(n) {
    return ((n % total) + total) % total;
  }

  function clearCardStyles() {
    cards.forEach((card) => {
      card.style.transition = "";
      card.style.transform = "";
      card.style.opacity = "";
      card.style.zIndex = "";
      card.style.pointerEvents = "";
    });
  }

  function render() {
    if (isMobile()) {
      clearCardStyles();
      return;
    }

    cards.forEach((card, i) => {
      let d = i - active;
      if (d > total / 2) d -= total;
      if (d < -total / 2) d += total;

      const abs = Math.abs(d);
      const scale = abs === 0 ? 1 : Math.max(0.45, 1 - abs * 0.2);
      const opacity = abs === 0 ? 1 : Math.max(0, 1 - abs * 0.35);
      const x = d * stepX;

      card.style.transition = "transform 0.45s ease, opacity 0.45s ease";
      card.style.transform = `translateX(${x}%) scale(${scale})`;
      card.style.opacity = String(opacity);
      card.style.zIndex = String(100 - abs);
      card.style.pointerEvents = abs <= 1 ? "auto" : "none";
    });
  }

  function go(dir) {
    if (isMobile() || animating) return;
    animating = true;
    active = wrap(active + dir);
    render();
    window.setTimeout(() => {
      animating = false;
    }, 450);
  }

  prevBtn?.addEventListener("click", () => go(-1));
  nextBtn?.addEventListener("click", () => go(1));

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      if (animating) return;

      if (isMobile()) {
        const img = card.querySelector("img");
        if (!img) return;
        openLightbox(img.currentSrc || img.src, img.alt);
        return;
      }

      let d = index - active;
      if (d > total / 2) d -= total;
      if (d < -total / 2) d += total;

      // Center image
      if (d === 0) {
        const img = card.querySelector("img");
        if (!img) return;
        openLightbox(img.currentSrc || img.src, img.alt);
        return;
      }

      // Right visible image
      if (d === 1) {
        go(1);
        return;
      }

      // Left visible image
      if (d === -1) {
        go(-1);
      }
    });
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target !== lightboxImg) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  stage.addEventListener(
    "wheel",
    (e) => {
      if (isMobile()) return;

      // Prevent page scrolling anywhere over the carousel
      e.preventDefault();

      const card = e.target.closest(".masterpiece-carousel-item");
      if (!card) return;

      const index = cards.indexOf(card);

      let d = index - active;
      if (d > total / 2) d -= total;
      if (d < -total / 2) d += total;

      // Only the center card responds to wheel
      if (d !== 0) return;

      if (Math.abs(e.deltaY) < 8) return;

      go(e.deltaY > 0 ? 1 : -1);
    },
    { passive: false },
  );

  stage.tabIndex = 0;
  stage.addEventListener("keydown", (e) => {
    if (isMobile()) return;

    if (
      e.key === "ArrowRight" ||
      e.key === "ArrowDown" ||
      e.key === "PageDown"
    ) {
      e.preventDefault();
      go(1);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      go(-1);
    }
  });

  const onViewportChange = () => render();
  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", onViewportChange);
  } else {
    mobileQuery.addListener(onViewportChange);
  }

  render();
}
