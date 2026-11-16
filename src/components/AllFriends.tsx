"use client";

import { useCallback, useState } from "react";
import type { Pet } from "@/content";
import { allPets } from "@/pets";
import { Catalog } from "./Pets";
import { Footer, Meet } from "./Sections";
import PageHeader from "./PageHeader";
import { nb } from "@/lib/typo";
import s from "./allFriends.module.scss";


// Страница «Все друзья»: шапка, заголовок, каталог всех животных
export default function AllFriends() {
  const [pet, setPet] = useState<Pet | null>(null);
  const close = useCallback(() => setPet(null), []);
  return (
    <>
      <PageHeader />
      <main className={s.main}>
        <p className={s.label}>Все друзья</p>
        <h1 className={s.h1}>
          {allPets.length} собак и кошек <em>ищут дом</em>
        </h1>
        <p className={s.lead}>{nb("Выберите, кто вам ближе, и запишитесь на знакомство.")}</p>
        <Catalog onMeet={setPet} />
      </main>
      <Footer />
      <Meet key={pet?.id ?? "none"} pet={pet} onClose={close} />
    </>
  );
}
