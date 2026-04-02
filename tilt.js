/** Zentry-style 3D tilt — vanilla. Skips coarse pointers; reduced motion = shadow only.
 * Usage: const t = new Tilt(el, { maxRotation: 12, scale: 1.02, glare: true }); t.destroy();
 *        Tilt.applyToAll('.card'); */
(function (g) {
  const lerp = (a, b, t) => a + (b - a) * t;
  const coarse = () => g.matchMedia("(pointer: coarse)").matches;
  const reduce = () => g.matchMedia("(prefers-reduced-motion: reduce)").matches;

  class Tilt {
    constructor(el, o = {}) {
      this.el = el;
      this.o = { maxRotation: 12, scale: 1.02, glare: true, glareOpacity: 0.15, perspective: 800, ...o };
      this.rx = this.ry = this.tx = this.ty = 0;
      this.s = this.ts = 1;
      this.raf = null;
      this.hover = false;
      this.glareEl = null;
      this._mv = (e) => this._move(e);
      this._in = () => this._enter();
      this._out = () => this._leave();
      if (!el || coarse()) return (this._skip = true);
      el.style.position = "relative";
      el.style.transformStyle = "preserve-3d";
      el.style.willChange = "transform, box-shadow";
      if (reduce()) {
        this._rm = true;
        return el.addEventListener("pointermove", this._mv), el.addEventListener("pointerleave", this._out);
      }
      if (this.o.glare) {
        this.glareEl = el.appendChild(document.createElement("div"));
        Object.assign(this.glareEl.style, { pointerEvents: "none", position: "absolute", inset: "0", borderRadius: "inherit", opacity: String(this.o.glareOpacity), zIndex: "1" });
      }
      el.addEventListener("pointerenter", this._in);
      el.addEventListener("pointermove", this._mv);
      el.addEventListener("pointerleave", this._out);
    }

    _norm(e) {
      const r = this.el.getBoundingClientRect();
      return { nx: ((e.clientX - r.left) / r.width - 0.5) * 2, ny: ((e.clientY - r.top) / r.height - 0.5) * 2 };
    }

    _move(e) {
      if (this._rm) {
        const { nx, ny } = this._norm(e);
        return (this.el.style.boxShadow = `${nx * 10}px ${ny * 10}px 28px rgba(0,0,0,.08)`);
      }
      const { nx, ny } = this._norm(e);
      this.tx = ny * -this.o.maxRotation;
      this.ty = nx * this.o.maxRotation;
      this.ts = this.o.scale;
    }

    _enter() {
      this.hover = true;
      this.el.style.transition = "";
      if (this.glareEl) (this.glareEl.style.transition = ""), (this.glareEl.style.opacity = String(this.o.glareOpacity));
      this._tick();
    }

    _leave() {
      if (this._rm) return (this.el.style.boxShadow = "");
      this.hover = false;
      if (typeof this.o.onMove === "function") this.o.onMove(0, 0);
      g.cancelAnimationFrame(this.raf);
      this.raf = null;
      const p = this.o.perspective,
        ease = "0.6s cubic-bezier(0.23, 1, 0.32, 1)";
      const restScale = this.o.scale;
      this.el.style.transition = `transform ${ease}`;
      this.el.style.transform = `perspective(${p}px) rotateX(0) rotateY(0) scale(${restScale})`;
      if (this.glareEl) (this.glareEl.style.transition = `opacity ${ease}`), (this.glareEl.style.opacity = "0");
      setTimeout(() => {
        this.rx = this.ry = 0;
        this.s = restScale;
        this.el.style.transition = this.el.style.transform = "";
        if (this.glareEl) (this.glareEl.style.transition = ""), (this.glareEl.style.opacity = String(this.o.glareOpacity)), (this.glareEl.style.background = "none");
        if (typeof this.o.onRest === "function") this.o.onRest();
      }, 600);
    }

    _tick() {
      if (this._destroyed || this._rm || !this.hover) return;
      this.rx = lerp(this.rx, this.tx, 0.08);
      this.ry = lerp(this.ry, this.ty, 0.08);
      this.s = lerp(this.s, this.ts, 0.08);
      const p = this.o.perspective;
      this.el.style.transform = `perspective(${p}px) rotateX(${this.rx}deg) rotateY(${this.ry}deg) scale(${this.s})`;
      if (this.glareEl) {
        const px = 50 + (this.ry / this.o.maxRotation) * 35,
          py = 50 + (this.rx / this.o.maxRotation) * 35;
        this.glareEl.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,.3), transparent 60%)`;
      }
      if (typeof this.o.onMove === "function") this.o.onMove(this.rx, this.ry);
      this.raf = g.requestAnimationFrame(() => this._tick());
    }

    destroy() {
      if (this._skip) return;
      this._destroyed = true;
      this.hover = false;
      g.cancelAnimationFrame(this.raf);
      const el = this.el;
      if (this._rm) return el.removeEventListener("pointermove", this._mv), el.removeEventListener("pointerleave", this._out), el.style.removeProperty("box-shadow");
      el.removeEventListener("pointerenter", this._in);
      el.removeEventListener("pointermove", this._mv);
      el.removeEventListener("pointerleave", this._out);
      if (this.glareEl?.parentNode) this.glareEl.remove();
      ["position", "transformStyle", "willChange", "transition", "transform", "boxShadow"].forEach((k) =>
        el.style.removeProperty(k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()))
      );
    }

    static applyToAll(sel, o) {
      return [...document.querySelectorAll(sel)].map((el) => new Tilt(el, o));
    }
  }

  g.Tilt = Tilt;
})(typeof window !== "undefined" ? window : globalThis);
