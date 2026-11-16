import type { Story } from "@/content";
import s from "./stories.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Карточка истории: фото, имя, «было» зачёркнуто, «стало» — жирно; вся карточка — ссылка на страницу истории
export function StoryCard({ st, big }: { st: Story; big?: boolean }) {
  return (
    <a href={`${BASE}/stories/${st.id}/`} className={s.card} data-big={big || undefined}>
      <span className={s.cardPhoto}>
        <img src={`${BASE}/pets/${st.photo}.jpg`} alt="" loading="lazy" style={{ objectPosition: st.pos }} />
      </span>
      <span className={s.cardBody}>
        <span className={s.cardName}>{st.name}</span>
        <span className={s.before}>{st.before}</span>
        <span className={s.after}>{st.after}</span>
        <span className={s.read}>
          Читать историю <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden><path d="M3 9h11M10 4.5 14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </span>
    </a>
  );
}
