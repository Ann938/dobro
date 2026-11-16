import s from "./pageHeader.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Шапка внутренних страниц: логотип (на главную) и ссылка назад
export default function PageHeader({ back = { href: "/", label: "На главную" } }: { back?: { href: string; label: string } }) {
  return (
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
      <a href={`${BASE}${back.href}`} className={s.back}>
        ← {back.label}
      </a>
    </header>
  );
}
