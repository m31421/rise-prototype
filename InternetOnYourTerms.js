/* global gsap */
(function () {
  if (typeof gsap === "undefined") return;
  if (window.matchMedia("(max-width: 768px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const section = document.querySelector(".ioyt");
  const stage = document.querySelector(".ioyt__stage");
  const headline = document.querySelector(".ioyt__headline");
  const h2 = headline && headline.querySelector("h2");
  const cards = Array.from(document.querySelectorAll(".ioyt__card"));

  if (!section || !stage || !cards.length) return;

  /** Matches --color-brand-orange #e85c0d */
  const BRAND_ORANGE = { r: 232, g: 92, b: 13 };

  function surface(card) {
    return card.querySelector(".ioyt__card__panel") || card;
  }

  const CARD_COUNT = cards.length;
  /** Peek strip between stacked cards (px above the card in front). */
  const PEEK_PX = 48;
  /** Uniform scale by stack depth (index 1–3 = peeking). */
  const PEEK_SCALES = [1, 0.97, 0.94, 0.91];

  /** Peek-tab labels — match Figma copy */
  const TITLES = [
    "Total Home Advanced Wi-Fi",
    "Digital Phone ActivePhone",
    "Service Upgrades",
    "Plans for You, by You",
  ];

  const CARD_RADIUS = "8px";

  function getPanelH() {
    return Math.min(window.innerHeight * 0.6, 600);
  }

  function getActiveTop() {
    const vh = window.innerHeight;
    const h = getPanelH();
    return (vh - h) / 2;
  }

  function activeY() {
    const vh = window.innerHeight;
    const h = getPanelH();
    const centeredBottom = getActiveTop() + h;
    return -(vh - centeredBottom);
  }

  function peekY(depth) {
    const vh = window.innerHeight;
    const h = getPanelH();
    const activeTop = getActiveTop();
    const d = Math.max(1, Math.min(depth, 3));
    const desiredTop = activeTop - PEEK_PX * d;
    const desiredBottom = desiredTop + h;
    return -(vh - desiredBottom);
  }

  function peekScale(depth) {
    return PEEK_SCALES[Math.max(1, Math.min(depth, 3))];
  }

  function lerpPeek(p, fromDepth, toDepth) {
    const fromY = fromDepth === 0 ? activeY() : peekY(fromDepth);
    const toY = peekY(toDepth);
    const fromS = fromDepth === 0 ? 1 : peekScale(fromDepth);
    const toS = peekScale(toDepth);
    return {
      y: fromY + (toY - fromY) * p,
      scale: fromS + (toS - fromS) * p,
    };
  }

  cards.forEach((card, i) => {
    const label = document.createElement("div");
    label.className = "ioyt__card__peek-label";
    label.textContent = TITLES[i];
    surface(card).appendChild(label);
  });

  const progressEl = document.createElement("div");
  progressEl.className = "ioyt__progress";
  progressEl.setAttribute("aria-hidden", "true");
  for (let i = 0; i < CARD_COUNT; i++) {
    const dot = document.createElement("div");
    dot.className = "ioyt__progress__dot";
    progressEl.appendChild(dot);
  }
  stage.appendChild(progressEl);
  const dotEls = Array.from(progressEl.querySelectorAll(".ioyt__progress__dot"));

  cards.forEach((card) => {
    const el = surface(card);
    gsap.set(el, { y: window.innerHeight, scale: 1 });
    gsap.set(el, { borderRadius: CARD_RADIUS });
  });

  let activeIdx = -1;

  function setDots(idx) {
    dotEls.forEach((dot, i) => dot.classList.toggle("is-active", i === idx));
  }

  function setPeekingClasses(frontIdx) {
    cards.forEach((card, i) => {
      card.classList.toggle("ioyt__card--peeking", frontIdx >= 0 && i < frontIdx);
    });
  }

  function setZIndices(frontIdx) {
    cards.forEach((card, i) => {
      gsap.set(card, { zIndex: i <= frontIdx ? 10 + i : i });
    });
  }

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function applyTransforms() {
    const vh = window.innerHeight;
    const rect = section.getBoundingClientRect();
    const scrollLocal = -rect.top;
    const maxScroll = Math.max(0, section.offsetHeight - vh);
    const s = clamp(scrollLocal, 0, maxScroll);

    const introPx = vh;
    const introP = s < introPx ? clamp(s / introPx, 0, 1) : 1;

    const r = Math.round(lerp(255, BRAND_ORANGE.r, introP));
    const g = Math.round(lerp(255, BRAND_ORANGE.g, introP));
    const bCol = Math.round(lerp(255, BRAND_ORANGE.b, introP));
    stage.style.backgroundColor = "rgb(" + r + "," + g + "," + bCol + ")";

    if (h2) {
      const hr = Math.round(lerp(BRAND_ORANGE.r, 255, introP));
      const hg = Math.round(lerp(BRAND_ORANGE.g, 255, introP));
      const hb = Math.round(lerp(BRAND_ORANGE.b, 255, introP));
      h2.style.color = "rgb(" + hr + "," + hg + "," + hb + ")";
    }

    if (s <= introPx) {
      if (activeIdx !== -1) {
        activeIdx = -1;
        setDots(-1);
        setPeekingClasses(-1);
      }
      cards.forEach((card, i) => {
        gsap.set(surface(card), { y: vh, scale: 1 });
        gsap.set(surface(card), { borderRadius: CARD_RADIUS });
        gsap.set(card, { zIndex: i });
      });
      return;
    }

    const cardScrollTotal = Math.max(0, maxScroll - introPx);
    const slotPx = CARD_COUNT > 0 ? cardScrollTotal / CARD_COUNT : vh * 1.2;
    const riseH = slotPx * (70 / 120);

    const cardScroll = s - introPx;

    const slotIdx = Math.min(Math.floor(cardScroll / slotPx), CARD_COUNT - 1);
    const slotOffset = cardScroll - slotIdx * slotPx;

    if (slotOffset < riseH) {
      const p = riseH > 0 ? slotOffset / riseH : 1;
      const ease = 1 - Math.pow(1 - p, 2.5);
      const targetY = activeY();
      const y = vh + (targetY - vh) * ease;

      gsap.set(surface(cards[slotIdx]), { y, scale: 1 });
      gsap.set(surface(cards[slotIdx]), { borderRadius: CARD_RADIUS });
      gsap.set(cards[slotIdx], { zIndex: 10 + slotIdx });

      for (let j = 0; j < slotIdx; j++) {
        const fromDepth = slotIdx - 1 - j;
        const toDepth = slotIdx - j;
        const t = lerpPeek(ease, fromDepth, toDepth);
        gsap.set(surface(cards[j]), { y: t.y, scale: t.scale });
        gsap.set(surface(cards[j]), { borderRadius: "8px 8px 0 0" });
        gsap.set(cards[j], { zIndex: 10 + j });
      }

      for (let j = slotIdx + 1; j < CARD_COUNT; j++) {
        gsap.set(surface(cards[j]), { y: vh, scale: 1 });
        gsap.set(surface(cards[j]), { borderRadius: CARD_RADIUS });
        gsap.set(cards[j], { zIndex: j });
      }

      setZIndices(slotIdx);
      if (activeIdx !== slotIdx) {
        activeIdx = slotIdx;
        setDots(slotIdx);
        setPeekingClasses(slotIdx);
      }
    } else {
      gsap.set(surface(cards[slotIdx]), {
        y: activeY(),
        scale: 1,
      });
      gsap.set(surface(cards[slotIdx]), { borderRadius: CARD_RADIUS });
      gsap.set(cards[slotIdx], { zIndex: 10 + slotIdx });

      for (let j = 0; j < slotIdx; j++) {
        const depth = slotIdx - j;
        gsap.set(surface(cards[j]), {
          y: peekY(depth),
          scale: peekScale(depth),
        });
        gsap.set(surface(cards[j]), { borderRadius: "8px 8px 0 0" });
        gsap.set(cards[j], { zIndex: 10 + j });
      }

      for (let j = slotIdx + 1; j < CARD_COUNT; j++) {
        gsap.set(surface(cards[j]), { y: vh, scale: 1 });
        gsap.set(surface(cards[j]), { borderRadius: CARD_RADIUS });
        gsap.set(cards[j], { zIndex: j });
      }

      setZIndices(slotIdx);
      if (activeIdx !== slotIdx) {
        activeIdx = slotIdx;
        setDots(slotIdx);
        setPeekingClasses(slotIdx);
      }
    }
  }

  cards.forEach((card, i) => {
    const label = surface(card).querySelector(".ioyt__card__peek-label");
    if (!label) return;
    label.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const vh = window.innerHeight;
      const maxScroll = Math.max(0, section.offsetHeight - vh);
      const introPx = vh;
      const cardScrollTotal = Math.max(0, maxScroll - introPx);
      const slotPx = CARD_COUNT > 0 ? cardScrollTotal / CARD_COUNT : vh * 1.2;
      const riseH = slotPx * (70 / 120);
      const target = sectionTop + introPx + i * slotPx + riseH * 0.5;
      window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    });
  });

  let rafPending = false;
  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      applyTransforms();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      applyTransforms();
    },
    { passive: true }
  );

  applyTransforms();
})();
