import type { Metadata } from "next";
import s from "./lab.module.scss";

export const metadata: Metadata = { title: "Лапка на кнопках — проба", robots: { index: false } };

// Проба эффекта лапки на кнопках — сравнить варианты и выбрать
export default function Lab() {
  const rows = [
    { cls: s.logoTop, t: "В. Лапка-логотип выглядывает сверху", d: "Кнопка при наведении чуть темнее. Из-за верхнего края справа выглядывает лапка как в логотипе." },
    { cls: s.logoSide, t: "Г. Лапка выезжает сбоку", d: "Лапка-логотип выезжает из-за правого края кнопки." },
    { cls: s.logoCorner, t: "Д. Лапка тянется из-за угла", d: "Лапка показывается из-за левого верхнего угла, как будто кошка тянется к кнопке." },
    { cls: s.logoTwo, wrap: true, t: "Е. Две лапки держат кнопку", d: "Две лапки-логотипа выглядывают сверху с двух сторон." },
    { cls: s.darkOnly, t: "Ж. Только темнее, без лапки", d: "Для сравнения: кнопка просто чуть темнеет." },
    { cls: s.peek, t: "А. Лапка выглядывает из-за кнопки", d: "Рыжая лапка с розовыми подушечками выглядывает из-за кнопки и цепляется за верхний край." },
    { cls: s.walk, t: "Б. Следы по кнопке", d: "Позади текста пробегает дорожка светлых следов." },
    { cls: s.both, t: "А + Б вместе", d: "Лапка сверху и следы по кнопке." },
  ];
  return (
    <main className={s.main}>
      <h1 className={s.h1}>Лапка при наведении</h1>
      <p className={s.lead}>Наведите курсор на кнопки и выберите вариант.</p>
      {rows.map((r) => (
        <section key={r.t} className={s.row}>
          <div>
            <h2 className={s.h2}>{r.t}</h2>
            <p>{r.d}</p>
          </div>
          <div className={s.btns}>
            {["Найти друга", "Записаться на 17 ноября, 10:00"].map((label) =>
              "wrap" in r ? (
                <span key={label} className={s.two}>
                  <a href="#" className={`${s.btn} ${r.cls}`}>
                    {label}
                  </a>
                </span>
              ) : (
                <a key={label} href="#" className={`${s.btn} ${r.cls}`}>
                  {label}
                </a>
              ),
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
