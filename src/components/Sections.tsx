"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { adopt, faq, footer, featured, friends, help, stories, type Pet } from "@/content";
import { allPets } from "@/pets";
import { Arrow, KindTabs, Paw, PetCard, img, type KindId } from "./Pets";
import credits from "@/credits.json";
import { StoryCard } from "./StoryCard";
import { nb } from "@/lib/typo";
import s from "./sections.module.scss";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const rub = (n: number) => n.toLocaleString("ru-RU") + " ₽";

// ---------- Найдите друга (главная: избранные + ссылка на всех) ----------
export function Friends({ onMeet }: { onMeet: (p: Pet) => void }) {
  const [k, setK] = useState<KindId>("all");
  const list = featured.filter((p) => k === "all" || p.kind === k).slice(0, 8);
  return (
    <section id="friends" className={s.friends}>
      <div className={s.head}>
        <div>
          <p className={s.label} data-reveal>
            {friends.label}
          </p>
          <h2 className={s.h2} data-reveal style={{ ["--d" as string]: 1 }}>
            {friends.title}
          </h2>
        </div>
        <p className={s.headText} data-reveal style={{ ["--d" as string]: 2 }}>
          {friends.text}
        </p>
      </div>
      <div className={s.bar} data-reveal style={{ ["--d" as string]: 3 }}>
        <KindTabs value={k} onChange={setK} />
        <a href={`${BASE}/friends/`} className={s.link}>
          {friends.all} {allPets.length} <Arrow />
        </a>
      </div>
      <ul className={s.grid} key={k}>
        {list.map((p, i) => (
          <li key={p.id} style={{ ["--i" as string]: i }}>
            <PetCard p={p} onMeet={onMeet} />
          </li>
        ))}
      </ul>
      <div className={s.allWrap}>
        <a href={`${BASE}/friends/`} className={s.btn}>
          {friends.all} {allPets.length} друзей <Arrow />
        </a>
      </div>
    </section>
  );
}

// ---------- Знакомство (окно) ----------
// В выходные приезжают без записи (11–17), на будни — выбор даты в календаре и времени
const WD = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const SLOTS = ["10:00", "12:00", "14:00", "16:00", "18:00"];
const dayOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
// часть времени «занята» — как в настоящем расписании (детерминированно от даты)
const taken = (d: Date, i: number) => (d.getDate() * 7 + d.getMonth() * 3 + i * 5) % 6 === 0;
const firstFree = (d: Date) => SLOTS.findIndex((_, i) => !taken(d, i));

function Calendar({ value, onChange, min }: { value: Date; onChange: (d: Date) => void; min: Date }) {
  const [view, setView] = useState({ y: value.getFullYear(), m: value.getMonth() });
  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const canPrev = view.y > min.getFullYear() || view.m > min.getMonth();
  const canNext = (view.y - min.getFullYear()) * 12 + view.m - min.getMonth() < 1; // текущий месяц и следующий
  const shift = (k: number) => setView(({ y, m }) => ({ y: m + k < 0 ? y - 1 : m + k > 11 ? y + 1 : y, m: (m + k + 12) % 12 }));
  return (
    <div className={s.cal}>
      <div className={s.calHead}>
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Предыдущий месяц">
          ‹
        </button>
        <b>
          {MONTHS[view.m]} {view.y}
        </b>
        <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Следующий месяц">
          ›
        </button>
      </div>
      <div className={s.calGrid} role="grid">
        {WD.map((w, i) => (
          <span key={w} className={s.calWd} data-weekend={i > 4 || undefined}>
            {w}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(view.y, view.m, i + 1);
          const we = isWeekend(d);
          const off = d < min || we;
          const on = d.getTime() === value.getTime();
          return (
            <button
              key={i}
              type="button"
              className={s.calDay}
              disabled={off}
              aria-pressed={on}
              data-weekend={(we && d >= min) || undefined}
              aria-label={`${i + 1} ${MONTHS_GEN[view.m]}${we ? ", выходной — без записи" : ""}`}
              onClick={() => onChange(d)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// окно создаётся только при выборе питомца — дата «сегодня» читается в браузере, а не при сборке
export function Meet({ pet, onClose }: { pet: Pet | null; onClose: () => void }) {
  return pet ? <MeetSheet pet={pet} onClose={onClose} /> : null;
}

function MeetSheet({ pet, onClose }: { pet: Pet; onClose: () => void }) {
  // ближайший будний день начиная с завтрашнего
  const [min] = useState(() => {
    const d = dayOnly(new Date());
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [date, setDate] = useState(() => {
    const d = new Date(min);
    while (isWeekend(d)) d.setDate(d.getDate() + 1);
    return d;
  });
  const [slot, setSlot] = useState(() => Math.max(0, firstFree(date)));
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    box.current?.querySelector<HTMLElement>("[aria-label=Закрыть]")?.focus();
    const l = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    l?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      l?.start();
    };
  }, [pet, onClose]);
  const pick = (d: Date) => (setDate(d), setSlot(Math.max(0, firstFree(d))));
  const when = `${date.getDate()} ${MONTHS_GEN[date.getMonth()]}, ${SLOTS[slot]}`;
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get("phone") || "").replace(/\D/g, "");
    if (!String(fd.get("name") || "").trim()) return setErr("name");
    if (phone.length < 10) return setErr("phone");
    setErr(null);
    setSent(true);
  };
  return (
    <div className={s.modal} role="dialog" aria-modal="true" aria-label={`Знакомство: ${pet.name}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.sheet} ref={box}>
        <button type="button" className={s.close} onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <img className={s.sheetPhoto} src={img(pet.id)} alt="" style={{ objectPosition: pet.pos }} />
        <div className={s.sheetBody}>
          {sent ? (
            <div className={s.done}>
              <Paw className={s.donePaw} />
              <h3 className={s.h3}>{pet.name} ждёт вас</h3>
              <p>
                {nb(`${date.getDate()} ${MONTHS_GEN[date.getMonth()]} в ${SLOTS[slot]}. Волонтёр позвонит накануне и напомнит, как добраться. Возьмите паспорт — и, если хотите, вкусняшку.`)}
              </p>
              <button type="button" className={s.btn} onClick={onClose}>
                Хорошо
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className={s.label}>Знакомство</p>
              <h3 className={s.h3}>
                {pet.name}, {pet.age}
              </h3>
              <p className={s.sheetLine}>{pet.line}</p>
              <p className={s.walkin}>
                <Paw className={s.walkinPaw} />
                <span>
                  В выходные приезжайте без записи: <b>сб–вс, 11:00–17:00</b>. На будни — выберите день и время.
                </span>
              </p>
              <p className={s.fieldLabel}>День в будни</p>
              <Calendar value={date} onChange={pick} min={min} />
              <p className={s.fieldLabel}>Время</p>
              <div className={s.days} role="radiogroup" aria-label="Время визита">
                {SLOTS.map((sl, i) => (
                  <button key={sl} type="button" role="radio" aria-checked={slot === i} disabled={taken(date, i)} onClick={() => setSlot(i)}>
                    {sl}
                  </button>
                ))}
              </div>
              <label className={s.field} data-error={err === "name" || undefined}>
                <span>Как вас зовут</span>
                <input name="name" autoComplete="name" />
                {err === "name" && <em>Напишите имя, чтобы волонтёр знал, кого встречать</em>}
              </label>
              <label className={s.field} data-error={err === "phone" || undefined}>
                <span>Телефон</span>
                <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7" />
                {err === "phone" && <em>Нужен номер из 10–11 цифр</em>}
              </label>
              <button type="submit" className={s.btn}>
                Записаться на {when}
                <Arrow />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Как забрать ----------
export function Adopt() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(`.${s.track} i`, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: `.${s.steps}`, start: "top 75%", end: "bottom 45%", scrub: 0.6 } });
      gsap.fromTo(`.${s.walker}`, { left: "0%" }, { left: "100%", ease: "none", scrollTrigger: { trigger: `.${s.steps}`, start: "top 75%", end: "bottom 45%", scrub: 0.6 } });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <section id="adopt" className={s.adopt} ref={ref}>
      <p className={s.label} data-reveal>
        {adopt.label}
      </p>
      <h2 className={s.h2} data-reveal style={{ ["--d" as string]: 1 }}>
        {adopt.title}
      </h2>
      <div className={s.track} aria-hidden>
        <i />
        <Paw className={s.walker} />
      </div>
      <ol className={s.steps}>
        {adopt.steps.map((st, i) => (
          <li key={st.t} data-reveal style={{ ["--d" as string]: i }}>
            <b>0{i + 1}</b>
            <h3 className={s.h3}>{st.t}</h3>
            <p>{st.d}</p>
          </li>
        ))}
      </ol>
      <a href="#friends" className={s.btn} data-reveal>
        {adopt.cta}
        <Arrow />
      </a>
    </section>
  );
}

// ---------- Помочь ----------
export function Help() {
  const [monthly, setMonthly] = useState(true);
  const [sum, setSum] = useState<number>(help.amounts[1].sum);
  const [own, setOwn] = useState("");
  const [thanks, setThanks] = useState(false);
  const total = own ? Number(own.replace(/\D/g, "")) || 0 : sum;
  const what = own ? "любая сумма — уже помощь" : help.amounts.find((a) => a.sum === sum)?.what;
  const rep = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rep.current!;
    const num = el.querySelector<HTMLElement>("[data-total]")!;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      el.setAttribute("data-on", "");
      const o = { v: 0 };
      gsap.to(o, { v: help.report.total, duration: 1.6, ease: "power2.out", onUpdate: () => (num.textContent = rub(Math.round(o.v / 100) * 100)) });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section id="help" className={s.help}>
      <p className={s.label} data-reveal>
        {help.label}
      </p>
      <h2 className={s.h2} data-reveal style={{ ["--d" as string]: 1 }}>
        {help.title}
      </h2>
      <div className={s.helpGrid}>
        <div className={s.donate} data-reveal>
          <div className={s.seg} role="radiogroup" aria-label="Как часто">
            <button type="button" role="radio" aria-checked={monthly} onClick={() => setMonthly(true)}>
              {help.monthly}
            </button>
            <button type="button" role="radio" aria-checked={!monthly} onClick={() => setMonthly(false)}>
              {help.once}
            </button>
            <i data-right={!monthly || undefined} />
          </div>
          <div className={s.amounts} role="radiogroup" aria-label="Сумма">
            {help.amounts.map((a) => (
              <button key={a.sum} type="button" role="radio" aria-checked={!own && sum === a.sum} onClick={() => (setSum(a.sum), setOwn(""))}>
                <b>{rub(a.sum)}</b>
                <span>{a.what}</span>
              </button>
            ))}
            <label className={s.own} data-on={!!own || undefined}>
              <span>Своя сумма</span>
              <input inputMode="numeric" value={own} placeholder="₽" onChange={(e) => setOwn(e.target.value.replace(/[^\d ]/g, "").slice(0, 7))} />
            </label>
          </div>
          <p className={s.what}>
            <Paw className={s.whatPaw} /> {total ? `${rub(total)}${monthly ? " в месяц" : ""} — ${what}` : "Введите сумму"}
          </p>
          {thanks ? (
            <p className={s.thanks}>Спасибо! В концепте платёж не проводится — но на настоящем сайте здесь была бы оплата.</p>
          ) : (
            <button type="button" className={s.btn} disabled={!total} onClick={() => setThanks(true)}>
              {help.cta} {total ? rub(total) : ""}
              <Arrow />
            </button>
          )}
        </div>
        <div className={s.side}>
          {[help.guard, help.hands].map((c, i) => (
            <div key={c.t} className={s.sideCard} data-reveal style={{ ["--d" as string]: i + 1 }}>
              <h3 className={s.h3}>{c.t}</h3>
              <p>{c.d}</p>
              <a href={i ? "#contacts" : "#friends"} className={s.link}>
                {c.cta} <Arrow />
              </a>
            </div>
          ))}
        </div>
      </div>
      <div className={s.report} ref={rep} data-reveal>
        <div className={s.reportHead}>
          <h3 className={s.h3}>{help.report.t}</h3>
          <b data-total>{rub(0)}</b>
        </div>
        <ul>
          {help.report.parts.map((p, i) => (
            <li key={p.t} style={{ ["--p" as string]: `${p.p}%`, ["--i" as string]: i }}>
              <span>{p.t}</span>
              <i />
              <b>{p.p}%</b>
            </li>
          ))}
        </ul>
        <p>{help.report.note}</p>
      </div>
    </section>
  );
}

// ---------- Было → стало (главная: три истории, каждая — ссылка на свою страницу) ----------
export function Stories() {
  return (
    <section className={s.stories}>
      <div className={s.storiesHead}>
        <div>
          <p className={s.label} data-reveal>
            {stories.label}
          </p>
          <h2 className={s.h2} data-reveal style={{ ["--d" as string]: 1 }}>
            {stories.title}
          </h2>
        </div>
        <a href={`${BASE}/stories/`} className={s.link} data-reveal style={{ ["--d" as string]: 2 }}>
          {stories.all} {stories.items.length} <Arrow />
        </a>
      </div>
      <ul className={s.storyList}>
        {stories.items.slice(0, 3).map((st, i) => (
          <li key={st.id} data-reveal style={{ ["--d" as string]: i }}>
            <StoryCard st={st} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Вопросы ----------
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className={s.faq}>
      <div>
        <p className={s.label} data-reveal>
          {faq.label}
        </p>
        <h2 className={s.h2} data-reveal style={{ ["--d" as string]: 1 }}>
          {faq.title}
        </h2>
      </div>
      <ul className={s.qa}>
        {faq.items.map((it, i) => (
          <li key={it.q} data-open={open === i || undefined}>
            <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              {it.q}
              <span aria-hidden />
            </button>
            <div className={s.ans}>
              <p>{it.a}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Подвал ----------
export function Footer() {
  return (
    <footer id="contacts" className={s.footer}>
      <p className={s.big}>
        {footer.title} <em>{footer.em}</em>
      </p>
      <div className={s.contacts}>
        {footer.cols.map((c) => (
          <div key={c.t}>
            <p className={s.cLabel}>{c.t}</p>
            {c.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        ))}
        <div>
          <p className={s.cLabel}>{footer.phone.t}</p>
          <a href={footer.phone.href} className={s.phone}>
            {footer.phone.v}
          </a>
        </div>
      </div>
      <details className={s.credits}>
        <summary>Фото: Wikimedia Commons — авторы и лицензии</summary>
        <ul>
          {credits.map((c) => (
            <li key={c.id}>
              <a href={c.source} target="_blank" rel="noopener noreferrer">
                {c.author || "автор не указан"}
              </a>{" "}
              — {c.license}
            </li>
          ))}
        </ul>
      </details>
    </footer>
  );
}
