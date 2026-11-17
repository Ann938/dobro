import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blog } from "@/blog";
import Smooth from "@/components/Smooth";
import { ArticlePage } from "@/components/BlogViews";

// Все статьи собираются статически (неизвестный адрес — 404 через notFound)
export function generateStaticParams() {
  return blog.items.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const st = blog.items.find((x) => x.id === id);
  return st ? { title: `${st.title} — Добро`, description: st.lead.replace(/ /g, " ") } : {};
}

// адрес читаем внутри Suspense — так страница работает и в разработке (cacheComponents), и в статической сборке
async function Post({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const st = blog.items.find((x) => x.id === id);
  if (!st) notFound();
  return <ArticlePage a={st} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <Smooth />
      <Suspense fallback={null}>
        <Post params={params} />
      </Suspense>
    </>
  );
}
