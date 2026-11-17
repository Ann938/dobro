import { blog, type Article } from "@/blog";
import PageHeader from "./PageHeader";
import { Arrow, BlogCard, articlePhoto } from "./BlogCard";
import { Footer } from "./Sections";
import s from "./blog.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

function Cta() {
  return (
    <section className={s.cta}>
      <h2 className={s.ctaTitle}>Готовы к знакомству?</h2>
      <p>У нас 120 собак и кошек. Каждого уже привили, стерилизовали и ждут дома.</p>
      <a href={`${BASE}/friends/`} className={s.btn}>
        Найти друга <Arrow />
      </a>
    </section>
  );
}

// Страница «Блог»: первая статья широкой карточкой, остальные — сеткой
export function BlogIndex() {
  const [first, ...rest] = blog.items;
  return (
    <>
      <PageHeader />
      <main className={s.main}>
        <p className={s.label}>{blog.label}</p>
        <h1 className={s.h1}>{blog.page.title}</h1>
        <p className={s.lead}>{blog.page.lead}</p>
        <ul className={s.grid}>
          <li className={s.gridWide}>
            <BlogCard a={first} wide />
          </li>
          {rest.map((a) => (
            <li key={a.id}>
              <BlogCard a={a} />
            </li>
          ))}
        </ul>
        <Cta />
      </main>
      <Footer />
    </>
  );
}

// Страница одной статьи
export function ArticlePage({ a }: { a: Article }) {
  const i = blog.items.findIndex((x) => x.id === a.id);
  const more = [1, 2].map((k) => blog.items[(i + k) % blog.items.length]);
  return (
    <>
      <PageHeader back={{ href: "/blog/", label: "Все статьи" }} />
      <main className={s.main}>
        <article>
          <header className={s.articleHead}>
            <p className={s.meta}>
              <span className={s.tagInline}>{a.tag}</span> {a.date} · {a.min} мин чтения
            </p>
            <h1 className={s.h1}>{a.title}</h1>
            <p className={s.lead}>{a.lead}</p>
          </header>
          <img className={s.articlePhoto} src={articlePhoto(a)} alt="" style={{ objectPosition: a.pos }} />
          <div className={s.articleBody}>
            {a.body.map((b, k) => (
              <section key={k}>
                {b.h && <h2 className={s.h3}>{b.h}</h2>}
                {b.p.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </section>
            ))}
            <aside className={s.tip}>
              <b>Коротко</b>
              <p>{a.tip}</p>
            </aside>
          </div>
        </article>
        <div className={s.more}>
          <p className={s.label}>Читать дальше</p>
          <ul className={s.moreGrid}>
            {more.map((m) => (
              <li key={m.id}>
                <BlogCard a={m} />
              </li>
            ))}
          </ul>
        </div>
        <Cta />
      </main>
      <Footer />
    </>
  );
}
