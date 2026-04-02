/** Fade in <main> images: stagger on first paint if in view; Intersection Observer for the rest. */
(function () {
  function isInViewport(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  }

  function init() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    if (!document.documentElement.classList.contains("img-reveal")) {
      return;
    }

    var imgs = document.querySelectorAll("main img");
    if (!imgs.length) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var img = entry.target;
          io.unobserve(img);
          img.classList.add("is-revealed");
        });
      },
      { root: null, rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );

    imgs.forEach(function (img, i) {
      if (isInViewport(img)) {
        window.setTimeout(function () {
          img.classList.add("is-revealed");
        }, i * 65);
      } else {
        io.observe(img);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
