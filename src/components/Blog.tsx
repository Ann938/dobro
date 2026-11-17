import { blog } from "@/blog";
import { Arrow, BlogCard, articleHref, articlePhoto } from "./BlogCard";
import s from "./blog.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Блог на главной: три статьи и кнопка «Все статьи», ниже одна статья (текст слева, фото справа)
export default function Blog() {
  const f = blog.items.find((a) => a.id === blog.featured) ?? blog.items[0];
  const three = blog.items.filter((a) => a !== f).slice(0, 3);

  return (
    <section id="blog" className={s.section}>
      <p className={s.label} data-reveal>
        {blog.label}
      </p>
      <h2 className={s.h2} data-reveal style={{ ["--d" as string]: 1 }}>
        {blog.title}
      </h2>

      <ul className={s.three}>
        {three.map((a, i) => (
          <li key={a.id} data-reveal style={{ ["--d" as string]: i }}>
            <BlogCard a={a} />
          </li>
        ))}
      </ul>
      <div className={s.allWrap}>
        <a href={`${BASE}/blog/`} className={s.btn}>
          {blog.all} <Arrow />
        </a>
      </div>

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
