"use client";

import { useCallback, useState } from "react";
import type { Pet } from "@/content";
import { allPets } from "@/pets";
import { Catalog } from "./Pets";
import { Footer, Meet } from "./Sections";
import s from "./allFriends.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Страница «Все друзья»: шапка, заголовок, каталог всех животных
export default function AllFriends() {
  const [pet, setPet] = useState<Pet | null>(null);
  const close = useCallback(() => setPet(null), []);
  return (
    <>
      <header className={s.header}>
        <a href={`${BASE}/`} className={s.logo}>
          <svg viewBox="0 0 32 32" aria-hidden>
            <path d="M16 27s-10-6.2-10-13.2C6 9.6 9 7 12.2 7c1.9 0 3 .9 3.8 2 .8-1.1 1.9-2 3.8-2C23 7 26 9.6 26 13.8 26 20.8 16 27 16 27z" fill="var(--accent)" />
            <circle cx="12.6" cy="14.2" r="1.5" fill="var(--cream)" />
            <circle cx="19.4" cy="14.2" r="1.5" fill="var(--cream)" />
            <ellipse cx="16" cy="18.4" rx="2.2" ry="1.6" fill="var(--cream)" />
          </svg>
          Добро
        </a>
        <a href={`${BASE}/`} className={s.back}>
          ← На главную
        </a>
      </header>
      <main className={s.main}>
        <p className={s.label}>Все друзья</p>
        <h1 className={s.h1}>
          {allPets.length} собак и кошек <em>ищут дом</em>
        </h1>
        <p className={s.lead}>Выберите, кто вам ближе, и запишитесь на знакомство — волонтёр встретит у ворот.</p>
        <Catalog onMeet={setPet} />
      </main>
      <Footer />
      <Meet key={pet?.id ?? "none"} pet={pet} onClose={close} />
    </>
  );
}
