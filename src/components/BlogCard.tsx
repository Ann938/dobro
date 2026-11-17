import type { Article } from "@/blog";
import s from "./blog.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 9h11M10 4.5 14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const articleHref = (a: Article) => `${BASE}/blog/${a.id}/`;
export const articlePhoto = (a: Article) => `${BASE}/pets/${a.photo}.jpg`;

// Карточка статьи: фото, рубрика и время чтения, заголовок, подводка; вся карточка — ссылка
export function BlogCard({ a, wide }: { a: Article; wide?: boolean }) {
  return (
    <a href={articleHref(a)} className={s.card} data-wide={wide || undefined}>
      <span className={s.cardPhoto}>
        <img src={articlePhoto(a)} alt="" loading="lazy" style={{ objectPosition: a.pos }} />
        <span className={s.tag}>{a.tag}</span>
      </span>
      <span className={s.cardBody}>
        <span className={s.meta}>
          {a.date} · {a.min} мин
        </span>
        <span className={s.cardTitle}>{a.title}</span>
        <span className={s.cardLead}>{a.lead}</span>
        <span className={s.read}>
          Читать статью <Arrow />
        </span>
      </span>
    </a>
  );
}
