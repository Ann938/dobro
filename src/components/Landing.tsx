"use client";

import { useCallback, useState } from "react";
import type { Pet } from "@/content";
import Hero from "./Hero";
import { Adopt, Faq, Footer, Friends, Help, Meet, Stories } from "./Sections";

export default function Landing() {
  const [pet, setPet] = useState<Pet | null>(null);
  const close = useCallback(() => setPet(null), []);
  return (
    <>
      <main>
        <Hero />
        <Friends onMeet={setPet} />
        <Adopt />
        <Help />
        <Stories />
        <Faq />
      </main>
      <Footer />
      {/* новое окно на каждого питомца — форма каждый раз с чистого листа */}
      <Meet key={pet?.id ?? "none"} pet={pet} onClose={close} />
    </>
  );
}
