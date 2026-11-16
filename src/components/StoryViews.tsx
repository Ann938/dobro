import { stories, type Story } from "@/content";
import PageHeader from "./PageHeader";
import { StoryCard } from "./StoryCard";
import { Footer } from "./Sections";
import s from "./stories.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const photo = (st: Story) => `${BASE}/pets/${st.photo}.jpg`;

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M3 9h11M10 4.5 14.5 9 10 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Блок в конце: следующая история и призыв найти друга
function Cta() {
  return (
    <section className={s.cta}>
      <h2 className={s.ctaTitle}>{stories.cta.t}</h2>
      <p>{stories.cta.d}</p>
      <a href={`${BASE}/friends/`} className={s.btn}>
        {stories.cta.btn} <Arrow />
      </a>
    </section>
  );
}

// Страница «Все истории»
export function StoriesIndex() {
  return (
    <>
      <PageHeader />
      <main className={s.main}>
        <p className={s.label}>{stories.label}</p>
        <h1 className={s.h1}>{stories.page.title}</h1>
        <p className={s.lead}>{stories.page.lead}</p>
        <ul className={s.grid}>
          {stories.items.map((st) => (
            <li key={st.id}>
              <StoryCard st={st} big />
            </li>
          ))}
        </ul>
        <Cta />
      </main>
      <Footer />
    </>
  );
}

// Страница одной истории
export function StoryPage({ st }: { st: Story }) {
  const i = stories.items.findIndex((x) => x.id === st.id);
  const next = stories.items[(i + 1) % stories.items.length];
  return (
    <>
      <PageHeader back={{ href: "/stories/", label: "Все истории" }} />
      <main className={s.main}>
        <article>
          <div className={s.hero}>
            <img className={s.heroPhoto} src={photo(st)} alt={st.name} style={{ objectPosition: st.pos }} />
            <div className={s.heroText}>
              <p className={s.label}>История · {i + 1} из {stories.items.length}</p>
              <h1 className={s.h1}>{st.name}</h1>
              <p className={s.beforeBig}>
                <span>Было</span> {st.before}
              </p>
              <p className={s.afterBig}>
                <span>Стало</span> {st.after}
              </p>
              <dl className={s.facts}>
                {st.facts.map((f) => (
                  <div key={f.t}>
                    <dt>{f.t}</dt>
                    <dd>{f.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className={s.body}>
            {st.chapters.map((c, k) => (
              <section key={c.t} className={s.chapter}>
                <b>0{k + 1}</b>
                <div>
                  <h2 className={s.h3}>{c.t}</h2>
                  <p>{c.d}</p>
                </div>
              </section>
            ))}
            <blockquote className={s.quote}>
              <p>«{st.quote.t}»</p>
              <footer>— {st.quote.who}</footer>
            </blockquote>
          </div>
        </article>
        <div className={s.next}>
          <p className={s.label}>Следующая история</p>
          <StoryCard st={next} />
        </div>
        <Cta />
      </main>
      <Footer />
    </>
  );
}
