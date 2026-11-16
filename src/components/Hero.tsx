"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import s from "./hero.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

type Rnd = () => number;
const rng = (seed: number): Rnd => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// След на «стекле». mask — где стекло мутное (за ним всё размыто и светлее). Без капель и блеска — следы, а не слюни.
// Отпечаток носа: жирное пятно с рваным краем, внутри — «булыжная» фактура мочки, ноздри — мутнее всего.
function drawPrint(mask: CanvasRenderingContext2D, wet: CanvasRenderingContext2D, cx: number, cy: number, r: number, seed: number) {
  const rnd = rng(seed);
  const blob = (x: number, y: number, rr: number, a: number) => {
    const g = mask.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    mask.fillStyle = g;
    mask.beginPath();
    mask.arc(x, y, rr, 0, Math.PI * 2);
    mask.fill();
  };
  // общее пятно — шире, чем выше (мочка носа)
  for (let i = 0; i < 90; i++) {
    const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), 0.7) * r;
    blob(cx + Math.cos(a) * d * 1.2, cy + Math.sin(a) * d * 0.85, r * (0.12 + rnd() * 0.2), 0.12 + rnd() * 0.16);
  }
  // фактура мочки: мелкие ячейки, плотнее к центру
  const cell = r * 0.045;
  for (let y = -r * 0.75; y < r * 0.75; y += cell * 1.15) {
    for (let x = -r; x < r; x += cell * 1.15) {
      const e = (x / r) ** 2 / 1.1 + (y / (r * 0.75)) ** 2;
      if (e > 1) continue;
      const jx = (rnd() - 0.5) * cell * 0.6, jy = (rnd() - 0.5) * cell * 0.6;
      mask.fillStyle = `rgba(0,0,0,${(0.25 + rnd() * 0.45) * (1 - e * 0.7)})`;
      mask.beginPath();
      mask.arc(cx + x + jx, cy + y + jy, cell * (0.35 + rnd() * 0.25), 0, Math.PI * 2);
      mask.fill();
    }
  }
  // ноздри
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) blob(cx + side * r * (0.32 + rnd() * 0.08), cy + r * (0.02 + rnd() * 0.1), r * (0.1 + rnd() * 0.06), 0.55);
  }
}

// Отпечаток языка: широкая мутная полоса снизу вверх (сухой след, без капель)
function drawLick(mask: CanvasRenderingContext2D, wet: CanvasRenderingContext2D, cx: number, cy: number, r: number, seed: number) {
  const rnd = rng(seed);
  const N = 26;
  const path = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    return { x: cx + Math.sin(t * 1.8 + 0.3) * r * 0.3 + (rnd() - 0.5) * r * 0.06, y: cy + r * 1.7 - t * r * 2.6, w: r * (0.62 - Math.pow(Math.abs(t - 0.4), 1.4) * 0.75) };
  });
  for (const { x, y, w } of path) {
    const g = mask.createRadialGradient(x, y, 0, x, y, w);
    g.addColorStop(0, "rgba(0,0,0,0.3)");
    g.addColorStop(0.75, "rgba(0,0,0,0.2)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    mask.fillStyle = g;
    mask.beginPath();
    mask.arc(x, y, w, 0, Math.PI * 2);
    mask.fill();
  }
}

// Первый экран: щенок (сгенерированное видео, research/gen2) подходит к экрану, лижет «стекло» и садится; ролик по кругу.
// След носа, запотевание и мазки языка на «стекле» рисуются поверх видео в моменты касания (время — по кадрам ролика).
const NOSE = { x: 0.5, y: 0.5 }; // нос щенка у стекла — доли кадра
const EV = { print: 3.9, fog: [4.4, 5.2, 6.0], lick: [6.2, 6.95, 8.2], dry: 10.2, close: [3.3, 9.0] };

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const wetC = useRef<HTMLCanvasElement>(null);
  const fog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = root.current!, boxEl = box.current!, vid = video.current!;
    const glassEl = glass.current!, wc = wetC.current!, fogEl = fog.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desk = () => window.matchMedia("(min-width: 1024px)").matches;
    let dead = false;

    // ---- раскладка: кадр 16:9 стоит на нижнем крае; на ДВ щенок правее текста ----
    const geo = { W: 0, H: 0, left: 0, top: 0, nx: 0, ny: 0 };
    const mask = document.createElement("canvas");
    const layout = () => {
      const r = hero.getBoundingClientRect();
      if (desk()) {
        geo.H = r.height;
        geo.top = 0;
      } else {
        // МВ: заголовок → видео → кнопка; видео занимает всё место между текстом и кнопкой
        const tb = textRef.current!.getBoundingClientRect().bottom - r.top;
        const cb = ctaRef.current!.getBoundingClientRect().top - r.top;
        geo.top = tb + 4;
        geo.H = Math.max(200, cb - tb - 8);
      }
      geo.W = (geo.H * 16) / 9;
      const cx = desk() ? r.width * 0.62 : r.width * 0.5;
      geo.left = cx - geo.W / 2;
      geo.nx = geo.left + geo.W * NOSE.x;
      geo.ny = geo.top + geo.H * NOSE.y;
      Object.assign(boxEl.style, { width: `${geo.W}px`, height: `${geo.H}px`, left: `${geo.left}px`, top: `${geo.top}px` });
      fogEl.style.setProperty("--fx", `${geo.nx}px`);
      fogEl.style.setProperty("--fy", `${geo.ny}px`);
      for (const c of [mask, wc]) {
        c.width = Math.round(r.width / 2);
        c.height = Math.round(r.height / 2);
      }
    };
    layout();
    document.fonts?.ready.then(() => !dead && layout()); // высота текста на МВ меняется после загрузки шрифтов
    window.addEventListener("resize", layout);

    // ---- «стекло» ----
    const mctx = mask.getContext("2d")!, wctx = wc.getContext("2d")!;
    // маску кодируем асинхронно (toBlob), чтобы не тормозить видео и страницу в момент касания
    let maskUrl = "";
    const applyMask = () =>
      mask.toBlob((b) => {
        if (!b || dead) return;
        const prev = maskUrl;
        maskUrl = URL.createObjectURL(b);
        glassEl.style.maskImage = `url(${maskUrl})`;
        glassEl.style.setProperty("-webkit-mask-image", `url(${maskUrl})`);
        if (prev) setTimeout(() => URL.revokeObjectURL(prev), 500);
      });
    const R = () => (geo.W * 0.05) / 2; // размер отпечатка носа (в половинном разрешении)
    let seed = 7;
    const clear = () => {
      mctx.clearRect(0, 0, mask.width, mask.height);
      wctx.clearRect(0, 0, wc.width, wc.height);
      applyMask();
    };
    const print = () => {
      drawPrint(mctx, wctx, geo.nx / 2, geo.ny / 2, R(), seed++);
      applyMask();
      gsap.set([glassEl, wc], { opacity: 1 });
    };
    const lick = () => {
      drawLick(mctx, wctx, geo.nx / 2 + ((seed % 3) - 1) * R() * 0.25, geo.ny / 2 + R() * 0.6, R() * 1.1, seed++);
      applyMask();
    };
    const breath = () => gsap.fromTo(fogEl, { opacity: 0.25 }, { opacity: 0.85, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" });

    // ---- сценарий по времени ролика; ролик крутится по кругу целиком ----
    let last = 0;
    let raf = 0;
    const tick = () => {
      const t = vid.currentTime;
      // новый круг: стекло снова чистое
      if (t + 1 < last) {
        gsap.killTweensOf([glassEl, wc, fogEl]);
        clear();
        gsap.set([glassEl, wc, fogEl], { opacity: 0 });
        last = 0;
      }
      const hit = (e: number) => last < e && t >= e;
      if (hit(EV.print)) print();
      EV.fog.forEach((e) => hit(e) && breath());
      EV.lick.forEach((e) => hit(e) && lick());
      // щенок отошёл — след на стекле высыхает до конца круга
      if (hit(EV.dry)) gsap.to([glassEl, wc], { opacity: 0, duration: 3.5, ease: "power1.in" });
      last = t;
      // вблизи текст чуть уходит, чтобы не спорить с мордой
      const [a, b] = EV.close;
      const k = Math.max(0, Math.min(1, (t - a) / 0.5, (b - t) / 0.5));
      hero.style.setProperty("--k", k.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // старт: как только ролик готов; при «меньше движения» — стоп-кадр, где щенок сидит
    const start = () => {
      if (dead) return;
      hero.setAttribute("data-ready", "");
      if (reduced) {
        vid.loop = false;
        vid.currentTime = vid.duration ? vid.duration - 0.1 : 14.9;
      } else vid.play().catch(() => {});
    };
    if (vid.readyState >= 3) start();
    else vid.addEventListener("canplay", start, { once: true });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
    };
  }, []);

  return (
    <section ref={root} id="top" className={s.hero}>
      <header className={s.header}>
        <a href="#top" className={s.logo} aria-label="Добро — наверх">
          <svg viewBox="0 0 32 32" aria-hidden>
            <path d="M16 27s-10-6.2-10-13.2C6 9.6 9 7 12.2 7c1.9 0 3 .9 3.8 2 .8-1.1 1.9-2 3.8-2C23 7 26 9.6 26 13.8 26 20.8 16 27 16 27z" fill="var(--accent)" />
            <circle cx="12.6" cy="14.2" r="1.5" fill="var(--cream)" />
            <circle cx="19.4" cy="14.2" r="1.5" fill="var(--cream)" />
            <ellipse cx="16" cy="18.4" rx="2.2" ry="1.6" fill="var(--cream)" />
          </svg>
          Добро
        </a>
        <nav className={s.nav} aria-label="Разделы">
          <a href="#friends">Найти друга</a>
          <a href="#adopt">Как забрать</a>
          <a href="#help">Помочь</a>
        </nav>
        <a href="#help" className={s.headerBtn}>
          Помочь приюту
        </a>
      </header>

      <div className={s.dog} ref={box} aria-hidden>
        <video ref={video} className={s.video} src={`${BASE}/pup/pup.mp4`} poster={`${BASE}/pup/poster.jpg`} muted loop playsInline preload="auto" />
      </div>

      <div className={s.text} ref={textRef}>
        <p className={s.label}>Приют «Добро» · Москва</p>
        <h1 className={s.h1}>
          Найдите друга, который <em>уже ждёт</em>
        </h1>
        <p className={s.lead}>120 собак и кошек ищут дом. Познакомиться можно за один визит, документы и осмотр у ветеринара берём на себя.</p>
        <div className={s.ctas}>
          <a href="#friends" className={s.btn}>
            Найти друга
          </a>
          <a href="#adopt" className={s.ghost}>
            Как забрать домой
          </a>
        </div>
      </div>

      {/* на МВ кнопка — под видео */}
      <a href="#friends" className={`${s.btn} ${s.mvCta}`} ref={ctaRef}>
        Найти друга
      </a>

      {/* «стекло» экрана: след носа, мазки языка и запотевание поверх всего */}
      <div className={s.glass} ref={glass} aria-hidden />
      <canvas className={s.wet} ref={wetC} aria-hidden />
      <div className={s.fog} ref={fog} aria-hidden />

    </section>
  );
}
