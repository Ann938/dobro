import LogoMark from "./Logo";
import s from "./pageHeader.module.scss";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Шапка внутренних страниц: логотип (на главную) и ссылка назад
export default function PageHeader({ back = { href: "/", label: "На главную" } }: { back?: { href: string; label: string } }) {
  return (
    <header className={s.header}>
      <a href={`${BASE}/`} className={s.logo}>
        <LogoMark />
        Добро
      </a>
      <a href={`${BASE}${back.href}`} className={s.back}>
        ← {back.label}
      </a>
    </header>
  );
}
