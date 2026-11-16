"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ages, kinds, type Pet } from "@/content";
import { allPets } from "@/pets";
import s from "./pets.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const img = (id: string) => `${BASE}/pets/${id}.jpg`;
export type KindId = (typeof kinds)[number]["id"];
type AgeId = (typeof ages)[number]["id"];

export function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 9h11M10 4.5 14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function Paw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <ellipse cx="12" cy="16" rx="5" ry="4.2" fill="currentColor" />
      <ellipse cx="5.5" cy="10.5" rx="2.1" ry="2.7" fill="currentColor" />
      <ellipse cx="9.5" cy="6.5" rx="2.1" ry="2.8" fill="currentColor" />
      <ellipse cx="14.5" cy="6.5" rx="2.1" ry="2.8" fill="currentColor" />
      <ellipse cx="18.5" cy="10.5" rx="2.1" ry="2.7" fill="currentColor" />
    </svg>
  );
}

// Вкладки вида животного с бегунком под выбранной
export function KindTabs({ value, onChange, list = allPets }: { value: KindId; onChange: (k: KindId) => void; list?: Pet[] }) {
  const i = kinds.findIndex((k) => k.id === value);
  return (
    <div className={s.tabs} role="tablist" aria-label="Кого показать" style={{ ["--i" as string]: i, ["--n" as string]: kinds.length }}>
      {kinds.map((k) => (
        <button key={k.id} type="button" role="tab" aria-selected={value === k.id} onClick={() => onChange(k.id)}>
          {k.label}
          <span>{list.filter((p) => k.id === "all" || p.kind === k.id).length}</span>
        </button>
      ))}
      <i aria-hidden />
    </div>
  );
}

export function PetCard({ p, onMeet }: { p: Pet; onMeet: (p: Pet) => void }) {
  return (
    <button type="button" className={s.card} onClick={() => onMeet(p)} aria-label={`Познакомиться: ${p.name}, ${p.age}`}>
      <span className={s.photo}>
        <img src={img(p.id)} alt="" loading="lazy" style={{ objectPosition: p.pos }} />
        <span className={s.meet}>
          Познакомиться <Arrow />
        </span>
      </span>
      <span className={s.cardHead}>
        <span className={s.name}>{p.name}</span>
        <span className={s.meta}>
          {p.age} · {p.sex}
        </span>
      </span>
      <span className={s.tags}>
        {p.tags.slice(0, 2).map((t) => (
          <i key={t}>{t}</i>
        ))}
      </span>
      <span className={s.line}>{p.line}</span>
    </button>
  );
}

// Переключатель-галочка
function Toggle({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={s.toggle} onClick={() => onChange(!on)}>
      <span className={s.knob} aria-hidden />
      {children}
    </button>
  );
}

// Выпадающий список возраста (свой, не нативный select)
function AgeSelect({ value, onChange }: { value: AgeId; onChange: (v: AgeId) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  const cur = ages.find((a) => a.id === value)!;
  return (
    <div className={s.select} ref={ref} data-open={open || undefined}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        {cur.label}
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M3 5.5 7 9.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul role="listbox" aria-label="Возраст">
        {ages.map((a) => (
          <li key={a.id} role="option" aria-selected={a.id === value}>
            <button type="button" onClick={() => (onChange(a.id), setOpen(false))}>
              {a.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Страница «Все друзья»: вкладки вида, галочки и возраст, сетка с подгрузкой
const STEP = 24;
export function Catalog({ onMeet }: { onMeet: (p: Pet) => void }) {
  const [k, setK] = useState<KindId>("all");
  const [kids, setKids] = useState(false);
  const [flat, setFlat] = useState(false);
  const [age, setAge] = useState<AgeId>("any");
  const [shown, setShown] = useState(STEP);
  const a = ages.find((x) => x.id === age)!;
  // вкладки считают с учётом галочек и возраста, список — ещё и с учётом вкладки
  const base = useMemo(() => allPets.filter((p) => (!kids || p.kids) && (!flat || p.flat) && p.months >= a.min && p.months <= a.max), [kids, flat, a]);
  const list = base.filter((p) => k === "all" || p.kind === k);
  const reset = () => (setKids(false), setFlat(false), setAge("any"));
  const set = <T,>(f: (v: T) => void) => (v: T) => (f(v), setShown(STEP));
  return (
    <div className={s.catalog}>
      <div className={s.controls}>
        <KindTabs value={k} onChange={set(setK)} list={base} />
        <div className={s.extra}>
          <Toggle on={kids} onChange={set(setKids)}>
            Ладит с детьми
          </Toggle>
          <Toggle on={flat} onChange={set(setFlat)}>
            Для квартиры
          </Toggle>
          <AgeSelect value={age} onChange={set(setAge)} />
        </div>
      </div>
      <p className={s.found} aria-live="polite">
        {list.length ? `Нашли ${list.length}` : "Никого не нашли"}
        {(kids || flat || age !== "any") && (
          <button type="button" onClick={() => (reset(), setShown(STEP))}>
            Сбросить фильтры
          </button>
        )}
      </p>
      <ul className={s.grid}>
        {list.slice(0, shown).map((p, i) => (
          <li key={p.id} style={{ ["--i" as string]: i % STEP }}>
            <PetCard p={p} onMeet={onMeet} />
          </li>
        ))}
      </ul>
      {shown < list.length && (
        <div className={s.moreWrap}>
          <button type="button" className={s.moreBtn} onClick={() => setShown(shown + STEP)}>
            Показать ещё {Math.min(STEP, list.length - shown)}
            <span>
              {Math.min(shown, list.length)} из {list.length}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
