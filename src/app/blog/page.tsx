import type { Metadata } from "next";
import Smooth from "@/components/Smooth";
import { BlogIndex } from "@/components/BlogViews";

export const metadata: Metadata = { title: "Блог — Добро" };

export default function Page() {
  return (
    <>
      <Smooth />
      <BlogIndex />
    </>
  );
}
