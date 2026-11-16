"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import s from "./hero.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

type Rnd = () => number;
const rng = (seed: number): Rnd => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// След на «стекле». mask — где стекло мутное (за ним всё размыто и светлее), wet — едва заметный влажный блеск.
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
  // мелкие брызги вокруг — капли с крошечным бликом
  for (let i = 0; i < 26; i++) {
    const a = rnd() * Math.PI * 2, d = r * (0.8 + rnd() * 0.7);
    const x = cx + Math.cos(a) * d * 1.15, y = cy + Math.sin(a) * d * 0.9;
    const rr = 1 + rnd() * rnd() * r * 0.035;
    mask.fillStyle = "rgba(0,0,0,0.85)";
    mask.beginPath();
    mask.arc(x, y, rr, 0, Math.PI * 2);
    mask.fill();
    wet.fillStyle = "rgba(255,255,255,0.28)";
    wet.beginPath();
    wet.arc(x - rr * 0.3, y - rr * 0.3, Math.max(0.6, rr * 0.3), 0, Math.PI * 2);
    wet.fill();
  }
  // влажный блеск по верхнему краю пятна
  const g = wet.createRadialGradient(cx - r * 0.3, cy - r * 0.45, 0, cx - r * 0.3, cy - r * 0.45, r * 0.9);
  g.addColorStop(0, "rgba(255,255,255,0.10)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  wet.fillStyle = g;
  wet.beginPath();
  wet.ellipse(cx, cy, r * 1.2, r * 0.85, 0, 0, Math.PI * 2);
  wet.fill();
}

// Мазок языка: широкая мутная полоса снизу вверх с продольными прожилками и парой стекающих капель
function drawLick(mask: CanvasRenderingContext2D, wet: CanvasRenderingContext2D, cx: number, cy: number, r: number, seed: number) {
  const rnd = rng(seed);
  const N = 26;
  const path = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    return { x: cx + Math.sin(t * 1.8 + 0.3) * r * 0.3, y: cy + r * 1.7 - t * r * 2.6, w: r * (0.62 - Math.pow(Math.abs(t - 0.4), 1.4) * 0.75) };
  });
  for (const { x, y, w } of path) {
    const g = mask.createRadialGradient(x, y, 0, x, y, w);
    g.addColorStop(0, "rgba(0,0,0,0.42)");
    g.addColorStop(0.75, "rgba(0,0,0,0.3)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    mask.fillStyle = g;
    mask.beginPath();
    mask.arc(x, y, w, 0, Math.PI * 2);
    mask.fill();
  }
  // прожилки по ходу языка
  for (let k = 0; k < 9; k++) {
    const off = (rnd() - 0.5) * 1.4;
    mask.strokeStyle = `rgba(0,0,0,${0.25 + rnd() * 0.3})`;
    mask.lineWidth = 1 + rnd() * 2.5;
    mask.beginPath();
    path.forEach(({ x, y, w }, i) => (i ? mask.lineTo(x + off * w * 0.6, y) : mask.moveTo(x + off * w * 0.6, y)));
    mask.stroke();
  }
  // стекающие капли
  for (let i = 0; i < 3; i++) {
    const p = path[3 + Math.floor(rnd() * 5)];
    const x = p.x + (rnd() - 0.5) * p.w, len = r * (0.25 + rnd() * 0.45);
    const g = mask.createLinearGradient(0, p.y, 0, p.y + len);
    g.addColorStop(0, "rgba(0,0,0,0.6)");
    g.addColorStop(1, "rgba(0,0,0,0.25)");
    mask.fillStyle = g;
    mask.fillRect(x - 1.6, p.y, 3.2, len);
    mask.beginPath();
    mask.arc(x, p.y + len, 3.4, 0, Math.PI * 2);
    mask.fill();
    wet.fillStyle = "rgba(255,255,255,0.3)";
    wet.beginPath();
    wet.arc(x - 1, p.y + len - 1, 1.3, 0, Math.PI * 2);
    wet.fill();
  }
}

// Первый экран: щенок (сгенерированное видео, research/gen) подходит к экрану, лижет «стекло» и садится.
// След носа, запотевание и мазки языка на «стекле» рисуются поверх видео в моменты касания (время — по кадрам ролика).
const NOSE = { x: 0.51, y: 0.47 }; // нос щенка у стекла — доли кадра
const EV = { print: 3.9, fog: [4.15, 4.85, 6.95], lick: [5.65, 6.15, 7.65], close: [3.4, 8.4] };

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLVideoElement>(null);
  const idle = useRef<HTMLVideoElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const wetC = useRef<HTMLCanvasElement>(null);
  const fog = useRef<HTMLDivElement>(null);
  const boopRef = useRef<() => void>(() => {});

  useEffect(() => {
    const hero = root.current!, boxEl = box.current!, vIn = intro.current!, vIdle = idle.current!;
    const glassEl = glass.current!, wc = wetC.current!, fogEl = fog.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desk = () => window.matchMedia("(min-width: 1024px)").matches;
    let dead = false;

    // ---- раскладка: кадр 16:9 стоит на нижнем крае; на ДВ щенок правее текста ----
    const geo = { W: 0, H: 0, left: 0, top: 0, nx: 0, ny: 0 };
    const mask = document.createElement("canvas");
    const layout = () => {
      const r = hero.getBoundingClientRect();
      geo.H = desk() ? r.height : r.height * 0.56;
      geo.W = (geo.H * 16) / 9;
      const cx = desk() ? r.width * 0.62 : r.width * 0.5;
      geo.left = cx - geo.W / 2;
      geo.top = r.height - geo.H;
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
    window.addEventListener("resize", layout);

    // ---- «стекло» ----
    const mctx = mask.getContext("2d")!, wctx = wc.getContext("2d")!;
    const applyMask = () => {
      const url = `url(${mask.toDataURL()})`;
      glassEl.style.maskImage = url;
      glassEl.style.setProperty("-webkit-mask-image", url);
    };
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
      gsap.fromTo(hero, { x: 0 }, { x: 2, duration: 0.05, repeat: 3, yoyo: true, clearProps: "x" });
    };
    const lick = () => {
      drawLick(mctx, wctx, geo.nx / 2 + ((seed % 3) - 1) * R() * 0.25, geo.ny / 2 + R() * 0.6, R() * 1.1, seed++);
      applyMask();
    };
    const breath = () => gsap.fromTo(fogEl, { opacity: 0.25 }, { opacity: 0.85, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" });

    // ---- сценарий по времени ролика ----
    let last = 0;
    let raf = 0;
    const tick = () => {
      const t = vIn.currentTime;
      if (t < last) last = 0;
      const hit = (e: number) => last < e && t >= e;
      if (hit(EV.print)) print();
      EV.fog.forEach((e) => hit(e) && breath());
      EV.lick.forEach((e) => hit(e) && lick());
      last = t;
      // вблизи текст чуть уходит, чтобы не спорить с мордой
      const [a, b] = EV.close;
      const k = Math.max(0, Math.min(1, (t - a) / 0.5, (b - t) / 0.5));
      hero.style.setProperty("--k", (hero.hasAttribute("data-idle") ? 0 : k).toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const toIdle = () => {
      vIdle.currentTime = 0;
      vIdle.play().catch(() => {});
      hero.setAttribute("data-idle", "");
      // след на стекле медленно высыхает
      gsap.to([glassEl, wc], { opacity: 0, duration: 12, delay: 3, ease: "power1.in" });
    };
    vIn.addEventListener("ended", toIdle);

    const boop = () => {
      gsap.killTweensOf([glassEl, wc]);
      clear();
      last = 0;
      hero.removeAttribute("data-idle");
      vIn.currentTime = 0;
      vIn.play().catch(toIdle);
    };
    boopRef.current = boop;

    // старт: как только ролик готов (при «меньше движения» щенок сразу сидит)
    const start = () => {
      if (dead) return;
      hero.setAttribute("data-ready", "");
      if (reduced) {
        vIn.pause();
        toIdle();
      } else vIn.play().catch(toIdle);
    };
    if (vIn.readyState >= 3) start();
    else vIn.addEventListener("canplay", start, { once: true });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
      vIn.removeEventListener("ended", toIdle);
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
        <video ref={idle} className={s.video} src={`${BASE}/pup/idle.mp4`} muted loop playsInline preload="auto" />
        <video ref={intro} className={`${s.video} ${s.intro}`} src={`${BASE}/pup/intro.mp4`} poster={`${BASE}/pup/poster.jpg`} muted playsInline preload="auto" />
      </div>

      <div className={s.text}>
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

      {/* «стекло» экрана: след носа, мазки языка и запотевание поверх всего */}
      <div className={s.glass} ref={glass} aria-hidden />
      <canvas className={s.wet} ref={wetC} aria-hidden />
      <div className={s.fog} ref={fog} aria-hidden />

      <button type="button" className={s.boop} onClick={() => boopRef.current()}>
        Позвать ещё раз
      </button>
    </section>
  );
}
