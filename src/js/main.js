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
});
