(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const section = document.querySelector(".pricing");
  const leftCard = document.querySelector('[data-pricing-card="left"]');
  const centerCard = document.querySelector('[data-pricing-card="center"]');
  const rightCard = document.querySelector('[data-pricing-card="right"]');

  if (!section || !leftCard || !centerCard || !rightCard) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const mobile = window.matchMedia("(max-width: 768px)").matches;

  if (reduce) {
    gsap.set([leftCard, centerCard, rightCard], {
      opacity: 1,
      rotateY: 0,
      x: 0,
    });
    gsap.set(centerCard, { scale: 1.02 });
    return;
  }

  if (mobile) {
    gsap.set([leftCard, centerCard, rightCard], {
      rotateY: 0,
      x: 0,
      scale: 1,
      autoAlpha: 0,
      y: 28,
    });

    const introDelayM = 0.25;
    const staggerM = 0.22;
    const durM = 0.55;

    gsap
      .timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      })
      .to(
        leftCard,
        { autoAlpha: 1, y: 0, duration: durM, ease: "power2.out" },
        introDelayM
      )
      .to(
        centerCard,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1.02,
          duration: durM,
          ease: "power2.out",
        },
        introDelayM + staggerM
      )
      .to(
        rightCard,
        { autoAlpha: 1, y: 0, duration: durM, ease: "power2.out" },
        introDelayM + staggerM * 2
      );
    return;
  }

  /* Each card starts hidden / offset so they can enter one after another. */
  gsap.set(leftCard, {
    rotateY: 5,
    x: -12,
    scale: 0.97,
    autoAlpha: 0,
    y: 36,
    transformOrigin: "right center",
  });
  gsap.set(centerCard, {
    rotateY: 0,
    x: 0,
    scale: 0.94,
    autoAlpha: 0,
    y: 44,
    transformOrigin: "center center",
  });
  gsap.set(rightCard, {
    rotateY: -5,
    x: 12,
    scale: 0.97,
    autoAlpha: 0,
    y: 36,
    transformOrigin: "left center",
  });

  const introDelay = 0.35;
  /* Start time gap between each card (left → center → right). */
  const stagger = 0.38;
  const cardDuration = 0.82;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 72%",
      once: true,
    },
    onComplete: initTilt,
  });

  tl.to(
    leftCard,
    {
      rotateY: 0,
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: cardDuration,
      ease: "power3.out",
    },
    introDelay
  );

  tl.to(
    centerCard,
    {
      rotateY: 0,
      scale: 1.02,
      y: 0,
      autoAlpha: 1,
      duration: cardDuration,
      ease: "power3.out",
    },
    introDelay + stagger
  );

  tl.to(
    rightCard,
    {
      rotateY: 0,
      x: 0,
      y: 0,
      scale: 1,
      autoAlpha: 1,
      duration: cardDuration,
      ease: "power3.out",
    },
    introDelay + stagger * 2
  );

  function makeShadowUpdater(el, baseBlur, baseOpacity) {
    return function (rotX, rotY) {
      var offsetX = -rotY * 0.8;
      var offsetY = rotX * 0.8;
      var spreadFactor = Math.abs(rotX) + Math.abs(rotY);
      var blur = baseBlur + spreadFactor * 0.6;
      var opacity = baseOpacity + spreadFactor * 0.003;
      el.style.boxShadow =
        "0 " +
        (8 + offsetY) +
        "px " +
        blur +
        "px " +
        offsetX +
        "px rgba(0, 0, 0, " +
        opacity.toFixed(3) +
        ")";
    };
  }

  function tiltRestGsap(el, props) {
    return function () {
      gsap.set(el, props);
    };
  }

  function initTilt() {
    if (coarse || typeof Tilt === "undefined") return;

    new Tilt(leftCard, {
      maxRotation: 3,
      scale: 1.01,
      perspective: 1200,
      glare: true,
      glareOpacity: 0.05,
      onMove: makeShadowUpdater(leftCard, 24, 0.07),
      onRest: tiltRestGsap(leftCard, { rotateY: 0, x: 0, scale: 1 }),
    });

    new Tilt(centerCard, {
      maxRotation: 4,
      scale: 1.02,
      perspective: 1000,
      glare: true,
      glareOpacity: 0.08,
      onMove: makeShadowUpdater(centerCard, 32, 0.1),
      onRest: tiltRestGsap(centerCard, { rotateY: 0, x: 0, scale: 1.02 }),
    });

    new Tilt(rightCard, {
      maxRotation: 3,
      scale: 1.01,
      perspective: 1200,
      glare: true,
      glareOpacity: 0.05,
      onMove: makeShadowUpdater(rightCard, 24, 0.07),
      onRest: tiltRestGsap(rightCard, { rotateY: 0, x: 0, scale: 1 }),
    });

    leftCard.addEventListener("mouseleave", function () {
      leftCard.style.boxShadow = "";
    });
    centerCard.addEventListener("mouseleave", function () {
      centerCard.style.boxShadow = "";
    });
    rightCard.addEventListener("mouseleave", function () {
      rightCard.style.boxShadow = "";
    });
  }
})();
