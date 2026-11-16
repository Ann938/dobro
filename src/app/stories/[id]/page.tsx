import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { stories } from "@/content";
import Smooth from "@/components/Smooth";
import { StoryPage } from "@/components/StoryViews";

// Все истории собираются статически (неизвестный адрес — 404 через notFound).
// Страница целиком зависит от адреса — показываем её сразу готовой, без заглушки
export const instant = false;
export function generateStaticParams() {
  return stories.items.map((st) => ({ id: st.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const st = stories.items.find((x) => x.id === id);
  return st ? { title: `${st.name}: ${st.after.toLowerCase()} — Добро`, description: `${st.before}. ${st.after}.` } : {};
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const st = stories.items.find((x) => x.id === id);
  if (!st) notFound();
  return (
    <>
      <Smooth />
      <StoryPage st={st} />
    </>
  );
}
