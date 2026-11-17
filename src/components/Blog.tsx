"use client";

import { useEffect, useRef, useState } from "react";
import { blog } from "@/blog";
import { Arrow, BlogCard, articleHref, articlePhoto } from "./BlogCard";
import s from "./blog.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Блог на главной: лента карточек со скроллом и стрелками + ниже одна статья (текст слева, фото справа)
export default function Blog() {
  const rail = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const f = blog.items.find((a) => a.id === blog.featured) ?? blog.items[0];
  const rest = blog.items.filter((a) => a !== f);

  // стрелки гаснут у краёв ленты
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const upd = () => setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
    upd();
    el.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    return () => {
      el.removeEventListener("scroll", upd);
      window.removeEventListener("resize", upd);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = rail.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0")), behavior: "smooth" });
  };

  return (
    <section id="blog" className={s.section}>
      <div className={s.head}>
        <div>
          <p className={s.label} data-reveal>
            {blog.label}
          </p>
          <h2 className={s.h2} data-reveal style={{ ["--d" as string]: 1 }}>
            {blog.title}
          </h2>
        </div>
        <div className={s.headSide} data-reveal style={{ ["--d" as string]: 2 }}>
          <a href={`${BASE}/blog/`} className={s.link}>
            {blog.all} {blog.items.length} <Arrow />
          </a>
          <div className={s.arrows}>
            <button type="button" aria-label="Назад" onClick={() => go(-1)} disabled={edge.start}>
              <Arrow />
            </button>
            <button type="button" aria-label="Вперёд" onClick={() => go(1)} disabled={edge.end}>
              <Arrow />
            </button>
          </div>
        </div>
      </div>

      <ul className={s.rail} ref={rail} data-reveal>
        {rest.map((a) => (
          <li key={a.id}>
            <BlogCard a={a} />
          </li>
        ))}
        <li>
          <a href={`${BASE}/blog/`} className={s.allCard}>
            <span>{blog.all}</span>
            <b>{blog.items.length} статей о том, как жить вместе</b>
            <i aria-hidden>
              <Arrow />
            </i>
          </a>
        </li>
      </ul>

      <article className={s.feature} data-reveal>
        <div className={s.featureText}>
          <p className={s.meta}>
            <span className={s.tagInline}>{f.tag}</span> {f.date} · {f.min} мин
          </p>
          <h3 className={s.featureTitle}>{f.title}</h3>
          <p className={s.featureLead}>{f.lead}</p>
          <div className={s.excerpt}>
            {f.body[0].p.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <a href={articleHref(f)} className={s.btn}>
            {blog.read} <Arrow />
          </a>
        </div>
        <a href={articleHref(f)} className={s.featurePhoto} tabIndex={-1} aria-hidden>
          <img src={articlePhoto(f)} alt="" loading="lazy" style={{ objectPosition: f.pos }} />
        </a>
      </article>
    </section>
  );
}
