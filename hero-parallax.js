/** Mouse parallax for .hero__photo-wrap[data-parallax] — lerp-smoothed; skips coarse + reduced motion. */
(function () {
  const root = document.querySelector(".hero");
  if (!root) return;
  const wraps = root.querySelectorAll(".hero__photo-wrap[data-parallax]");
  if (!wraps.length) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (matchMedia("(pointer: coarse)").matches) return;

  const maxPx = 26;
  const state = [...wraps].map((el) => ({
    el,
    k: parseFloat(el.dataset.parallax) || 0.06,
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
  }));
  let raf = null;

  function tick() {
    let moving = false;
    for (const s of state) {
      s.x += (s.tx - s.x) * 0.1;
      s.y += (s.ty - s.y) * 0.1;
      s.el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      if (Math.abs(s.tx - s.x) > 0.04 || Math.abs(s.ty - s.y) > 0.04) moving = true;
    }
    raf = moving ? requestAnimationFrame(tick) : null;
  }

  function setTargets(e) {
    const r = root.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    for (const s of state) {
      s.tx = -nx * maxPx * s.k * 2.2;
      s.ty = -ny * maxPx * s.k * 2.2;
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function reset() {
    for (const s of state) {
      s.tx = 0;
      s.ty = 0;
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  root.addEventListener("mousemove", setTargets);
  root.addEventListener("mouseleave", reset);
})();
